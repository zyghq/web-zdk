interface ZygSDKInstance {
  q: any[][];
  booted: boolean;
  widgetId: string;
  processQueue: () => void;
  executeCommand: (...args: any[]) => void;
  push: (...args: any[]) => void;
  on: (eventName: string, callback: EventListenerOrEventListenerObject) => void;
  off: (
    eventName: string,
    callback: EventListenerOrEventListenerObject
  ) => void;
  init: (config: InitConfig) => void;
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

interface InitConfig {
  widgetId: string;
}

(function () {
  const bootZyg = function (): ZygSDKFunction {
    const instance: ZygSDKFunction = function (...args: any[]) {
      instance.push(...args);
    };

    instance.booted = false;
    instance.widgetId = null;

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
          instance.init(commandArgs[0]);
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

    // Function to handle init
    instance.init = function (config: InitConfig) {
      if (typeof config !== "object" || !config.widgetId) {
        throw new Error("Invalid configuration. widgetId is required.");
      }
      this.widgetId = config.widgetId;
      // Simulating asynchronous initialization
      setTimeout(() => {
        this._triggerEvent("ready");
        this.booted = true;
        // Simulate authentication after a delay
        setTimeout(() => {
          this._triggerEvent("authenticated");
        }, 500);
      }, 1000);
    };

    return instance;
  };
  const sdk = bootZyg();

  // Process any queued events
  if (window.ZygSDK.q) {
    for (let i = 0; i < window.ZygSDK.q.length; i++) {
      sdk.push.apply(sdk, window.ZygSDK.q[i]);
    }
  }
  window.ZygSDK = sdk;
  window.dispatchEvent(new Event("zygsdk:loaded"));
})();
