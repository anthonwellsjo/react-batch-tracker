
import React, { createContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface Props extends RouteComponentProps {
  children: React.ReactNode;
}

/** 
**An action tracker that lets you create simultaneous trackers that fires a callback
function after timeout finishes.** 

When you register a new action with the action() function 
you reset the timer on that tracker.

Can be used to batch APP state to database API calls for autosave functionality.

Example code:

#Create a new action tracker:
```
const actionTracker = useContext(ActionTrackerContext);

useEffect(()=>{
  actionTracker.create('inventory-list', 3000, syncInventoryListStateWithDatabase);
})
```

#Create an action which fires of the timer to the callback function.
```
const { action } = useContext(ActionTrackerContext);
function onStateChanged() {
  const updatedInventoryEntityItem = updateInventoryEntityItem(item, selectedPersonnel);
  action<InventoryEntityDocument>('inventory-list', updatedInventoryEntityItem);
}

*/
export interface ActionTrackerContext {
  /**An action resets the timeout. */
  action<T extends { _id: string | Types.ObjectId }>(
    /**The name of the tracker that should register a new edit action. */
    name: string,
    /**Should contain the data that you're tracking with the action tracker. */
    trackingItem?: TrackerItem<T>,
  ): void;

  /**Creates and stores a new tracker in the context state. */
  create<T extends { _id: string | Types.ObjectId }>(
    /**The name/identifier for the new tracker. */
    name: string,
    /**Timeout in milliseconds until the callback function is fired. */
    timeoutMs: number,
    /**The callback function that will be called once the timeout has finished. */
    callbackFunction: (items?: TrackerItem<T>[]) => void,
    /**Config to override default behaviour */
    config?: ActionTrackerConfig | undefined,
  ): void;

  /**Fires the callback and stop the counter. */
  overrideCallback: () => void;
}

export type TrackerItem<T> = T & { _id: string | Types.ObjectId };

export interface ActionTrackerConfig {
  /** When false, adds all actions in a stack rather than just updating the existing 
      action on that trackingItem. Defaults to true. */
  mutableActions?: boolean;
}

class Tracker<T extends { _id: string | Types.ObjectId }> {
  private _name: string;
  private _timeoutMs: number;
  private _callbackFunction: (items?: TrackerItem<T>[]) => void;
  private _timer: ReturnType<typeof setTimeout>;
  private _trackerItems: TrackerItem<T>[];
  private _config: ActionTrackerConfig;

  constructor(name: string, timeoutMs: number, callbackFunction: () => void, config?: ActionTrackerConfig) {
    this._name = name;
    this._timeoutMs = timeoutMs;
    this._callbackFunction = callbackFunction;
    this._trackerItems = [];
    this._config = getConfig(config);
  }

  addTrackerItem(item) {
    this._trackerItems.push(item);
  }

  public get name() {
    return this._name;
  }

  public get config() {
    return this._config;
  }

  public start() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._callbackFunction(this._trackerItems);
    }, this._timeoutMs);
  }

  /** Removes all tracker items with matching id*/
  public purgeTrackerItems(id: string | Types.ObjectId) {
    const _id = typeof id != 'string' ? id.toString() : id;
    this._trackerItems = this._trackerItems.filter((i) => i._id !== _id);
  }
}

export const ActionTrackerContext = createContext<ActionTrackerContext>({} as any);

function ActionTracker<T>(props: Props) {
  const [actionTrackers, setActionTrackers] = useState<Tracker<TrackerItem<T>>[]>([]);

  const create: ActionTrackerContext['create'] = (name, timeoutMs, callbackFunction) => {
    if (actionTrackers.some((t) => t.name === name)) {
      console.warn('Trying to add an action tracker that already exists. Aborting.');
      return;
    }

    const tracker = new Tracker<TrackerItem<T>>(name, timeoutMs, callbackFunction);
    setActionTrackers((prev) => [...prev, tracker]);
    return;
  };

  const action: ActionTrackerContext['action'] = (name, trackingItem) => {
    const tracker = findTracker<T>(actionTrackers, name);

    if (!tracker) {
      console.warn('Trying to create an action on a nonexisting tracker. Aborting.');
      return;
    }

    if (trackingItem) {
      if (tracker.config.mutableActions) tracker.purgeTrackerItems(trackingItem._id);

      tracker.addTrackerItem(trackingItem);
    }

    tracker.start();
    return;
  };

  const overrideCallback: ActionTrackerContext['overrideCallback'] = () => {
    alert('override callback');
    return;
  };

  const actionTracker: ActionTrackerContext = {
    create,
    action,
    overrideCallback,
  };

  return <ActionTrackerContext.Provider value={actionTracker}>{props.children}</ActionTrackerContext.Provider>;
}

export const ActionTrackerProvider = withRouter(ActionTracker);

function findTracker<T>(actionTrackers: Tracker<TrackerItem<T>>[], name: string) {
  return actionTrackers.find((t) => t.name === name);
}

function getConfig(config: ActionTrackerConfig | undefined): ActionTrackerConfig {
  return {
    mutableActions: config?.mutableActions ? config?.mutableActions : true,
  };
}
