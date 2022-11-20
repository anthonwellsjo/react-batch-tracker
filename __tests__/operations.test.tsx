import { render, screen, waitFor } from "@testing-library/react";
import { BatchTrackerProvider, Tracker, useBatchTracker } from "../lib/index";
import React, { useCallback, useContext, useEffect, useState } from "react";

const getRandomName = () => "tracker-" + Math.floor(Math.random() * 10000);

test("Should create a new batch", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker, getBatchTracker } = useBatchTracker();
    const [_, setTracker] = useState<
      Tracker<unknown & { id: string }> | undefined
    >(undefined);

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        testTracker.callbackFunction
      );
    }, []);

    useEffect(() => {
      setTracker(getBatchTracker(testTracker.name));
    }, []);

    return <p data-testid="tracker-name">{testTracker.name}</p>;
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(testTracker.name));
  });
});

test("Should run oncreatedevent callback function", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker } = useBatchTracker();
    const [text, setText] = useState<string | undefined>(undefined);

    const onCreatedCallbackFunction = () => {
      setText("on-created-callback");
    };

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        testTracker.callbackFunction,
        undefined,
        onCreatedCallbackFunction
      );
    }, []);

    return <p data-testid="tracker-name">{text}</p>;
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );
  await waitFor(() => {
    expect(screen.getByText("on-created-callback"));
  });
});

test("Should run regular callback function when config is set to countDownOnCreated: true", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker } = useBatchTracker();
    const [text, setText] = useState<string | undefined>(undefined);

    const callbackFunction = () => {
      setText("call-back-run");
    };

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        callbackFunction,
        { countdownOnCreated: true }
      );
    }, []);

    return <p data-testid="tracker-name">{text}</p>;
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );
  await waitFor(() => {
    expect(screen.getByText("call-back-run"));
  });
});

test("Should run regular callback function after action", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker, action } = useBatchTracker();
    const [text, setText] = useState<string | undefined>(undefined);
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
      console.log("action");
      action(testTracker.name);
    }, [trigger]);

    const onCreatedCallbackFunction = () => {
      setTrigger(1);
    };

    const callbackFunction = () => {
      setText("call-back-run");
    };

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        callbackFunction,
        undefined,
        onCreatedCallbackFunction
      );
    }, []);

    return <p data-testid="tracker-name">{text}</p>;
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );
  await waitFor(() => {
    expect(screen.getByText("call-back-run"));
  });
});

test("Should run only last callback when several actions registerered", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker, action } = useBatchTracker();
    const [clicks, setClicks] = useState<number[]>([1]);
    const [noOfCallBacks, setNoOfCallbacks] = useState(0);
    const [render, setRender] = useState(false);
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
      console.log("action");
      action(testTracker.name);
    }, [trigger]);

    const onCreatedCallbackFunction = () => {
      setTrigger(1);
    };

    const callbackFunction = () => {
      setNoOfCallbacks((prev) => prev + 1);
      setRender(true);
    };

    const onClickHandler = () => {
      setClicks((prev) => [...prev, prev[prev.length - 1] + 1]);
      action(testTracker.name);
    };

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        callbackFunction,
        undefined,
        onCreatedCallbackFunction
      );
    }, []);

    return (
      <>
        <button onClick={onClickHandler}>btn</button>
        {clicks.map((click) => (
          <p key={click}>{click.toString()}</p>
        ))}
        <p>no of callbacks {noOfCallBacks}</p>
      </>
    );
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );

  let btn;
  await waitFor(() => {
    btn = screen.getByText("btn");
    btn.click();
    btn.click();
    btn.click();
    btn.click();
  });

  await waitFor(() => {
    expect(screen.getByText("no of callbacks 1"));
    expect(screen.getByText("5"));
    expect(screen.getByText("4"));
    expect(screen.getByText("3"));
    expect(screen.getByText("2"));
    expect(screen.getByText("1"));
  });
});

test("Should return data when added to action", async () => {
  const testTracker = {
    name: getRandomName(),
    callbackTimeout: 10,
    callbackFunction: (_: any) => {},
  };
  const Consumer: React.FC = () => {
    const { createTracker, action } = useBatchTracker();
    const [trigger, setTrigger] = useState(0);
    const [data, setData] = useState({id: "123", myData: "not yet"});

    useEffect(() => {
      console.log("action");
      action(testTracker.name);
    }, [trigger]);

    const onCreatedCallbackFunction = () => {
      setTrigger(1);
      action(testTracker.name, { id: "123", myData: "ok" });
    };

    const callbackFunction = (data) => {
      console.log("abc123")
      console.log(data);
    };

    useEffect(() => {
      createTracker(
        testTracker.name,
        testTracker.callbackTimeout,
        callbackFunction,
        undefined,
        onCreatedCallbackFunction
      );
    }, []);

    return <p>{data.myData}</p>;
  };

  render(
    <BatchTrackerProvider>
      <Consumer />
    </BatchTrackerProvider>
  );

  await waitFor(() => {
    expect(screen.getByText("ok"));
  });

});
