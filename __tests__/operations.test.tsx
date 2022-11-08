import {render, screen, waitFor } from '@testing-library/react'
import {BatchTrackerContext, BatchTrackerProvider, Tracker} from '../lib/index';
import { useContext, useEffect, useState } from 'react';

const getRandomName = () => "tracker-" + Math.floor(Math.random()*10000)

test("Should create a new batch", async () => {
const testTracker = {
  name: getRandomName(),
  callbackTimeout: 10,
  callbackFunction: (_: any) => {},
}
  const Consumer: React.FC = () => {
    const { createTracker, getBatchTracker } = useContext(BatchTrackerContext);
    const [ _, setTracker ] = useState<Tracker<unknown & {id: string}> | undefined>(undefined);

    useEffect(()=>{
      createTracker(testTracker.name, testTracker.callbackTimeout, testTracker.callbackFunction);
    }, []);

    useEffect(()=>{
      setTracker(getBatchTracker(testTracker.name));

    }, []);

    return <p data-testid="tracker-name">{testTracker.name}</p>
  }

  render(
    <BatchTrackerProvider>
      <Consumer/>
    </BatchTrackerProvider>,
  )

  await waitFor(() => {
    expect(screen.getByText(testTracker.name))
  })
})

test("Should run oncreatedevent callback function", async () => {
const testTracker = {
  name: getRandomName(),
  callbackTimeout: 10,
  callbackFunction: (_: any) => {},
}
  const Consumer: React.FC = () => {
    const { createTracker } = useContext(BatchTrackerContext);
    const [text, setText] = useState<string | undefined>(undefined);

    const onCreatedCallbackFunction = () => {
      setText("on-created-callback");
    };

    useEffect(()=>{
      createTracker(testTracker.name, testTracker.callbackTimeout, testTracker.callbackFunction, undefined, onCreatedCallbackFunction )
    }, []);

    return <p data-testid="tracker-name">{text}</p>
  }

  render(
    <BatchTrackerProvider>
      <Consumer/>
    </BatchTrackerProvider>,
  )
  await waitFor(() => {
    expect(screen.getByText("on-created-callback"))
  })
})

test("Should run regular callback function when config is set to countDownOnCreated: true", async () => {
const testTracker = {
  name: getRandomName(),
  callbackTimeout: 10,
  callbackFunction: (_: any) => {},
}
  const Consumer: React.FC = () => {
    const { createTracker } = useContext(BatchTrackerContext);
    const [text, setText] = useState<string | undefined>(undefined);

    const callbackFunction = () => {
      setText("call-back-run");
    };

    useEffect(()=>{
      createTracker(testTracker.name, testTracker.callbackTimeout, callbackFunction, {countdownOnCreated: true} )
    }, []);

    return <p data-testid="tracker-name">{text}</p>
  }

  render(
    <BatchTrackerProvider>
      <Consumer/>
    </BatchTrackerProvider>,
  )
  await waitFor(() => {
    expect(screen.getByText("call-back-run"))
  }, {timeout: 1000})
})
