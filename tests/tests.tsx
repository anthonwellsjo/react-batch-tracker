
import {render, screen} from '@testing-library/react'
import {BatchTrackerContext, BatchTrackerProvider} from '../lib/index';
import { useContext, useEffect } from 'react';

const testTracker = {
  name: "test",
  callbackTimeout: 3000,
  callbackFunction: (data) => {console.log(data)},
}


test("Batch tracker successfully creates a new batch", () => {
const Consumer: React.FC = () => {
  const { createTracker, getBatch } = useContext(BatchTrackerContext);

  useEffect(()=>{
      createTracker(testTracker.name, testTracker.callbackTimeout, testTracker.callbackFunction);
  }, [])
  return null

}

  render(
    <BatchTrackerProvider>
      <Consumer/>
    </BatchTrackerProvider>,
  )
  expect(screen.getByText(/^Received:/).textContent).toBe('Received: Boba Fett')
})


