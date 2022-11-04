import {render, screen, waitFor } from '@testing-library/react'
import {BatchTrackerContext, BatchTrackerProvider, Tracker} from '../lib/index';
import { useContext, useEffect, useState } from 'react';

const testTracker = {
  name: "tracker-name",
  callbackTimeout: 1000,
  callbackFunction: (data: any) => {console.log(data)},
}


test("Should create a new batch", async () => {
  const Consumer: React.FC = () => {
    const { createTracker, getBatchTracker } = useContext(BatchTrackerContext);
    const [ tracker, setTracker ] = useState<Tracker<unknown & {id: string}> | undefined>(undefined);

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


// test("Should run callback function", async () => {
//   const Consumer: React.FC = () => {
//     const { createTracker, action} = useContext(BatchTrackerContext);
//     const [text, setText] = useState<string | undefined>(undefined);

//     const callbackFunction = () => {
//       setText("call-back-run");
//       console.log("set tect");
//     };

//     useEffect(()=>{
//       createTracker(testTracker.name, testTracker.callbackTimeout, testTracker.callbackFunction)
//         .then(()=>{
//           action(testTracker.name);
//         })
//     }, []);


//     return <p data-testid="tracker-name">{text}</p>
//   }

//   render(
//     <BatchTrackerProvider>
//       <Consumer/>
//     </BatchTrackerProvider>,
//   )
//   await waitFor(() => {
//     expect(screen.getByText("call-back-run"))
//   })
// })

