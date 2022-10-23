import {render, screen } from '@testing-library/react'
import {BatchTrackerContext, BatchTrackerProvider, Tracker} from '../lib/index';
import { useContext, useEffect, useState } from 'react';

const testTracker = {
  name: "test",
  callbackTimeout: 1000,
  callbackFunction: (data: any) => {console.log(data)},
}


test("Batch tracker successfully creates a new batch", () => {
const Consumer: React.FC = () => {
  const { createTracker, getBatchTracker } = useContext(BatchTrackerContext);
  const [ tracker, setTracker ] = useState<Tracker<unknown & {id: string}> | undefined>(undefined);

  useEffect(()=>{
      createTracker(testTracker.name, testTracker.callbackTimeout, testTracker.callbackFunction);
  }, []);

  useEffect(()=>{
      setTracker(getBatchTracker(testTracker.name));

  }, []);
  
  return <p data-testid="tracker-name">test</p>
}

  render(
    <BatchTrackerProvider>
      <Consumer/>
    </BatchTrackerProvider>,
  )
  expect(screen.getByTestId('tracker-name').textContent).toBe(testTracker.name)
})

