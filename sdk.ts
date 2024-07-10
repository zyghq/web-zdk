interface ZygSDKInstance {
  q: any[][];
  processQueue: () => void;
  executeCommand: (...args: any[]) => void;
  push: (...args: any[]) => void;
  on: (eventName: string, callback: EventListenerOrEventListenerObject) => void;
  off: (
    eventName: string,
    callback: EventListenerOrEventListenerObject
  ) => void;
  _eventTarget: EventTarget;
  _triggerEvent: (eventName: string, data: any) => void;
}

type ZygSDKFunction = {
  (...args: any[]): void;
  q?: any[][];
} & ZygSDKInstance;

interface Window {
  ZygSDK: ZygSDKFunction;
  zyged: any;
}

(function (window: Window) {
  // Initialize the SDK
  const sdkFn = function (): ZygSDKFunction {
    // Create the SDK instance
    const instance: ZygSDKFunction = function (...args: any[]) {
      instance.push(...args);
    };

    instance._eventTarget = new EventTarget();

    instance._triggerEvent = function (eventName, data) {
      const event = new CustomEvent(eventName, { detail: data });
      this._eventTarget.dispatchEvent(event);
    };

    // Initialize the queue
    instance.q = [];

    // Function to process the queue
    instance.processQueue = function () {
      while (instance.q.length > 0) {
        const args = instance.q.shift();
        if (args) {
          instance.executeCommand.apply(instance, args);
        }
      }
    };

    // Function to execute commands
    instance.executeCommand = function (...args: any[]) {
      const command = args[0];
      const commandArgs = args.slice(1);

      // Implement your SDK functionality here
      switch (command) {
        case "init":
          console.log("Initializing SDK with args:", commandArgs);
          break;
        case "track":
          console.log("Tracking event with args:", commandArgs);
          break;
        // Add more commands as needed
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    };

    // Function to handle new commands
    instance.push = function (...args: any[]) {
      if (typeof args[0] === "function") {
        args[0]();
      } else {
        instance.q.push(args);
        instance.processQueue();
      }
    };

    instance.on = function (
      eventName: string,
      callback: EventListenerOrEventListenerObject
    ) {
      instance._eventTarget.addEventListener(eventName, callback);
    };

    instance.off = function (
      eventName: string,
      callback: EventListenerOrEventListenerObject
    ) {
      instance._eventTarget.removeEventListener(eventName, callback);
    };

    // Process any queued commands
    instance.processQueue();

    return instance;
  };

  const sdk = sdkFn();

  // Process any queued events
  if (window.ZygSDK.q) {
    for (let i = 0; i < window.ZygSDK.q.length; i++) {
      sdk.push.apply(sdk, window.ZygSDK.q[i]);
    }
  }
  window.ZygSDK = sdk;
})(window);
