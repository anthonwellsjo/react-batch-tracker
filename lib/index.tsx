import { createContext, useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
}

/** 
**A batch tracker that lets you create simultaneous trackers that fires a callback
function after timeout finishes.** 

When you register a new action with the action() function 
you reset the timer on that tracker.

Can be used to batch APP state to database API calls for autosave functionality.

Example code:

#Create a new action tracker:
```
const actionTracker = useContext(BatchTrackerContext);
actionTracker.create('inventory-list', 3000, syncInventoryListStateWithDatabase);
```

#Create an action which reset and restart the timer to the callback function.
```
const { action } = useContext(BatchTrackerContext);
function onStateChanged() {
const updatedInventoryEntityItem = updateInventoryEntityItem(item, selectedPersonnel);
action<InventoryEntityDocument>('inventory-list', updatedInventoryEntityItem);
}

*/
export interface BatchTrackerInterface {
  /**An action resets the timeout. */
  action<T extends { id: string}>(
    /**The name of the tracker that should register the action. */
    name: string,
    /**Should contain the data that you're tracking with the action tracker. */
    trackingItem?: TrackerItem<T>,
  ): void;

  /**Creates and stores a new tracker in the context state. */
  createTracker<T extends { id: string}>(
    /**The name/identifier for the new tracker. */
    name: string,
    /**Timeout in milliseconds until the callback function is fired. */
    timeoutMs: number,
    /**The callback function that will be called once the timeout has finished. */
    callbackFunction: (items?: TrackerItem<T>[]) => void,
    /**Config to override default behaviour */
    config?: BatchTrackerConfig | undefined,
    onTrackerCreated?: (() => void) | undefined
  ): void;

  /**Fires the callback and stop the counter. */
  overrideCallback: (batchTrackerName: string) => void;

  /**Will manually emtpy the batch of all its' actions */
  cleanBatch: (batchTrackerName: string) => void;

  /**Fetch a batch tracker by name*/
  getBatchTracker(batchTrackerName: string) : Tracker<unknown & {id: string}> | undefined;
}

export type TrackerItem<T> = T & { id: string};

export interface BatchTrackerConfig {
  /** When false, all actions on the same tracking item will be kept in an array. This could be useful if some kind of undo
  functionality is needed and you the whole state mutation history for that batch.

  If set to true, only the latest action on the same item will be saved. 

  *Defaults to true. */
  mutableBatch?: boolean;

  /** If set to false, the batch will not be cleared on callback. This could result in memory leaks so make sure to 
  manually clear the batch.

  *Defaults to true. */
  cleanBatchOnCallback?: boolean
}

export class Tracker<T extends { id: string}> {
  private _name: string;
  private _timeoutMs: number;
  private _callbackFunction: (items?: TrackerItem<T>[]) => void;
  private _timer: ReturnType<typeof setTimeout>;
  private _trackerItems: TrackerItem<T>[];
  private _config: BatchTrackerConfig;
  private _onTrackerCreated: (() => void) | undefined;

  constructor(name: string, timeoutMs: number, callbackFunction: () => void, config?: BatchTrackerConfig, onTrackerCreated?: () => void) {
    this._name = name;
    this._timeoutMs = timeoutMs;
    this._callbackFunction = callbackFunction;
    this._trackerItems = [];
    this._config = getConfig(config);
    this._onTrackerCreated = onTrackerCreated;
  }

  addTrackerItem(item: any) {
    this._trackerItems.push(item);
  }

  public get name() {
    return this._name;
  }

  public get config() {
    return this._config;
  }

  public get onTrackerCreated(){
    return this._onTrackerCreated;
  }

  public runCallbackFunction() {
    this._callbackFunction(this._trackerItems);
  }

  public clearTimer(){
    clearTimeout(this._timer);
  }

  public start() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._callbackFunction(this._trackerItems);
    }, this._timeoutMs);
  }

  /** Removes all tracker items, or all tracker items with matching id*/
  public purgeTrackerItems(id?: string) {
    if (id){this._trackerItems = this._trackerItems.filter((i) => i.id !== id);}
    else {
      this._trackerItems = [];
    }
  }
}

const defaultConfig: BatchTrackerConfig = {
  mutableBatch: true
}

export const BatchTrackerContext = createContext<BatchTrackerInterface>({} as any);

export function BatchTrackerProvider<T>(props: Props) {
  const [batchTrackers, setBatchTrackers] = useState<Tracker<TrackerItem<T>>[]>([]);

  const createTracker: BatchTrackerInterface['createTracker'] = (name, timeoutMs, callbackFunction, config) => {
    if (batchTrackers.some((t) => t.name === name)) {
      console.warn('Trying to add an action tracker that already exists. Aborting.');
      return;
    }

    const tracker = new Tracker<TrackerItem<T>>(name, timeoutMs, callbackFunction, config);
    setBatchTrackers((prev) => [...prev, tracker]);
    return;
  };

  const action: BatchTrackerInterface['action'] = (name, trackingItem) => {
    const tracker = findTracker<T>(batchTrackers, name);

    if (!tracker) {
      console.warn('Trying to create an action on a nonexisting tracker. Aborting.');
      return;
    }

    if (trackingItem) {
      if (tracker.config.mutableBatch) tracker.purgeTrackerItems(trackingItem.id); 
      tracker.addTrackerItem(trackingItem);
    }
    tracker.start();
    return;
  };

  const overrideCallback: BatchTrackerInterface['overrideCallback'] = (batchTrackerName) => {
    const tracker = findTracker<T>(batchTrackers, batchTrackerName);
    if (!tracker) {
      console.warn('Trying to run callback function on a nonexisting tracker. Aborting.');
      return;
    }
    tracker.clearTimer();
    tracker.runCallbackFunction();
    if (tracker.config.cleanBatchOnCallback) tracker.purgeTrackerItems();
    return;
  };

  const cleanBatch: BatchTrackerInterface['cleanBatch'] = (batchTrackerName) => {
    const tracker = findTracker(batchTrackers, batchTrackerName);
    if (!tracker) {
      console.warn('Trying to clean batch on a nonexisting tracker. Aborting.');
      return;
    }
    tracker.purgeTrackerItems();
    return;
  }

  const getBatchTracker = (batchTrackerName: string) => {
    const tracker = findTracker(batchTrackers, batchTrackerName);
    return tracker;
  }

  const actionTracker: BatchTrackerInterface = {
    createTracker,
    action,
    overrideCallback,
    cleanBatch,
    getBatchTracker
  };

  return <BatchTrackerContext.Provider value={actionTracker}>{props.children}</BatchTrackerContext.Provider>;
}

function findTracker<T>(actionTrackers: Tracker<TrackerItem<T>>[], name: string) {
  return actionTrackers.find((t) => t.name === name);
}

function getConfig(config: BatchTrackerConfig | undefined): BatchTrackerConfig {
  return {
    mutableBatch: config?.mutableBatch != undefined ? config.mutableBatch : defaultConfig.mutableBatch,
    cleanBatchOnCallback: config?.cleanBatchOnCallback != undefined ? config.cleanBatchOnCallback : defaultConfig.cleanBatchOnCallback,
  };
}
