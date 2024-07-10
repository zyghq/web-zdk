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
  ZygEnv: string;
}

interface InitConfig {
  widgetId: string;
}

type BubblePosition = "left" | "right";
type Domains = string[] | null;
type ProfilePicture = string | null;

interface WidgetConfig {
  allowOnlyDomains: boolean;
  domainsOnly: boolean;
  domains: Domains;
  bubblePosition: BubblePosition;
  headerColor: string;
  profilePicture: ProfilePicture;
  iconColor: string;
}

const ENV = window.ZygEnv || "production";

const logger = (() => {
  if (ENV === "development") {
    return console.log.bind(console);
  } else {
    return () => {}; // noop function
  }
})();

(function () {
  var config: WidgetConfig;
  var isHidden = !0;
  var pageWidth = window.innerWidth;

  const baseUrl = "https://example.com";

  function loadWidgetConfig(widgetId: string): Promise<WidgetConfig> {
    logger("TODO:fetch widget config!", widgetId);
    const response = {
      allowOnlyDomains: false,
      domainsOnly: false,
      domains: null,
      bubblePosition: "right",
      headerColor: "#9370DB",
      profilePicture: null,
      iconColor: "#ffff",
    } as WidgetConfig;
    return Promise.resolve(response);
  }

  function hideZW() {
    var t = document.getElementById("zyg-frame");
    (t.style.opacity = "0"),
      (t.style.transform = "scale(0)"),
      (t.style.position = "fixed"),
      (document.getElementById("zyg-button").style.display = "block"),
      (isHidden = !0);
  }

  function showZW() {
    var t = document.getElementById("zyg-frame");
    ((t.style.opacity = "1"),
    (t.style.transform = "scale(1)"),
    (t.style.position = "fixed"),
    pageWidth < 768) &&
      (document.getElementById("zyg-button").style.display = "none");
    isHidden = !1;
  }

  function createZygWidget(config: WidgetConfig) {
    if (config.domainsOnly && config.domains) {
      const domains = config.domains;
      const d = window.location.hostname;
      if (!domains.includes(d)) {
        console.log("domain not allowed...");
        return;
      }
    }

    // create the iframe parent div container
    var frameContainer = document.createElement("div");
    frameContainer.setAttribute("id", "zyg-frame");
    // add styling
    var fcs =
        pageWidth > 768
          ? "width: 448px; height: 85vh; max-height: 820px"
          : "width: 100%; height: 100%; max-height: 100%; min-height: 100%; left: 0px; right: 0px; bottom: 0px; top: 0px;",
      bbp =
        config.bubblePosition && "right" === config.bubblePosition
          ? "right: 16px; left: unset; transform-origin: right bottom;"
          : "left: 16px; right: unset; transform-origin: left bottom;";
    frameContainer.style.cssText =
      "position: fixed !important; box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px; overflow: hidden !important; opacity: 0 !important; border: none !important; display: none !important; z-index: 2147483645 !important; border-radius: 0.75rem; bottom: 96px; transition: scale 200ms ease-out 0ms, opacity 200ms ease-out 0ms; transform: scale(0) !important;" +
      bbp +
      fcs;

    // create the iframe
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", "zyg-iframe"),
      iframe.setAttribute("title", "Zyg Widget"),
      iframe.setAttribute("src", baseUrl),
      iframe.setAttribute("frameborder", "0"),
      iframe.setAttribute("scrolling", "no"),
      iframe.setAttribute(
        "style",
        "border: 0px !important; width: 100% !important; height: 100% !important; display: block !important; opacity: 1 !important;"
      ),
      frameContainer.appendChild(iframe), // append the Iframe to the parent div container.
      document.body.appendChild(frameContainer);

    iframe.addEventListener("load", function () {
      logger("iframe on load...");
      var popButton = document.createElement("div");
      popButton.setAttribute("id", "zyg-button");

      // add styling to the button
      var pbs = "background-color:" + config.headerColor + ";";
      (pbs += "position: fixed; bottom: 1rem;"),
        (pbs +=
          config.bubblePosition && "right" === config.bubblePosition
            ? "right: 16px; left: unset;"
            : "left: 16px; right: unset;"),
        (pbs +=
          "width: 50px; height: 50px; border-radius: 25px; box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px; cursor: pointer; z-index: 2147483645;"),
        (pbs +=
          "transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out; transform: scale(0); opacity: 0;"),
        (popButton.style.cssText = pbs);

      var buttonInnerSt =
        '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; z-index: 2147483646;">';
      config.profilePicture
        ? (buttonInnerSt +=
            '<img src="' +
            config.profilePicture +
            '" style="width: 100%; height: 100%; border-radius: 100px;" />')
        : (buttonInnerSt += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${config.iconColor}" style="width: 60%; height: 60%;"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clip-rule="evenodd" /></svg>`),
        (buttonInnerSt += "</div>"),
        (popButton.innerHTML = buttonInnerSt),
        document.body.appendChild(popButton);

      setTimeout(function () {
        (popButton.style.opacity = "1"),
          (popButton.style.transform = "scale(1)"),
          (frameContainer.style.display = "block");
      }, 1e3),
        popButton.addEventListener("click", function () {
          isHidden ? showZW() : hideZW();
        });
    });
  }

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
          logger("init invoked with args:", commandArgs);
          instance.init(commandArgs[0]);
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
    instance.init = function (initConfig: InitConfig) {
      if (typeof initConfig !== "object" || !initConfig.widgetId) {
        throw new Error("Invalid configuration. widgetId is required.");
      }
      this.widgetId = initConfig.widgetId;

      loadWidgetConfig(this.widgetId)
        .then((c) => {
          logger("fetched widget config", c);
          config = c;
        })
        .then(() => {
          createZygWidget(config);
        })
        .catch((err) => {
          console.error("Error fetching widget config", err);
        });

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
