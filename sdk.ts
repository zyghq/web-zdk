interface ZygSDKInstance {
  q: any[][];
  booted: boolean;
  widgetId: string; // PK
  customerExternalId: string | null; // P1
  customerEmail: string | null; // P2
  customerPhone: string | null; // P3
  customerHash: string | null;
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
  onMessageHandler: (evt: MessageEvent) => void;
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
  customerExternalId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerHash?: string;
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

interface ZygSDKStorage {
  widgetId: string;
  anonId?: string;
  customerExternalId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerHash?: string;
}

const ENV = window.ZygEnv || "production";

const logger = (() => {
  if (ENV === "development") {
    return console.log.bind(console);
  } else {
    return () => {}; // noop function
  }
})();

/**
 * Sets a key-value pair in localStorage if available
 * @param key The key to set
 * @param value The value to set
 * @returns true if the operation was successful, false otherwise
 */
function setLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error setting localStorage:", error);
    return false;
  }
}

function getLocalStorage(key: string): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  } catch (error) {
    console.error("Error getting localStorage:", error);
    return null;
  }
}

/**
 * Generates a UUID v4 (random)
 * @returns A string representing a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    // Use the built-in crypto.randomUUID() if available
    return crypto.randomUUID();
  }

  // Fallback to manual UUID generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

(function () {
  var config: WidgetConfig;
  var isHidden = !0;
  var pageWidth = window.innerWidth;

  const baseUrl = "http://localhost:3000";

  function fetchWidgetConfig(widgetId: string): Promise<WidgetConfig> {
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

  function handleIfcReady(widgetId: string) {
    logger("handleIfcReady", widgetId);
    // fetch data from localstorage
    const data = getLocalStorage(widgetId);
    const iframe: HTMLIFrameElement = document.getElementById(
      "zyg-iframe"
    ) as HTMLIFrameElement;
    const message = {
      type: "customer",
      data: data,
    };
    iframe.contentWindow.postMessage(JSON.stringify(message), baseUrl);
  }

  function handlePageWidthChange() {
    pageWidth = window.innerWidth;
    var t = document.getElementById("zyg-frame"),
      e =
        pageWidth > 768
          ? "width: 448px; height: 72vh; max-height: 720px;"
          : "width: 100%; height: 100%; max-height: 100%; min-height: 100%; left: 0px; right: 0px; bottom: 0px; top: 0px;",
      i =
        "right" === config.bubblePosition
          ? "right: 16px; left: unset; transform-origin: right bottom;"
          : "left: 16px; right: unset; transform-origin: left bottom;",
      o = isHidden
        ? "opacity: 0 !important; transform: scale(0) !important;"
        : "opacity: 1 !important; transform: scale(1) !important;";
    t.style.cssText =
      "box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px; overflow: hidden !important; border: none !important; display: block !important; z-index: 2147483645 !important; border-radius: 0.75rem; bottom: 96px; transition: scale 200ms ease-out 0ms, opacity 200ms ease-out 0ms; position: fixed !important;" +
      i +
      e +
      o;
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
          ? "width: 448px; height: 72vh; max-height: 720px"
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

    instance.customerExternalId = null;
    instance.customerEmail = null;
    instance.customerPhone = null;
    instance.customerHash = null;

    instance._eventTarget = new EventTarget();
    instance._triggerEvent = function (eventName, data) {
      const event = new CustomEvent(eventName, { detail: data });
      this._eventTarget.dispatchEvent(event);
    };

    instance.onMessageHandler = function (evt: MessageEvent) {
      logger("**************** sdk ******************");
      logger("evt origin:", evt.origin);
      logger("evt source", evt.source);
      logger("evt data", evt.data);
      if (evt.origin !== baseUrl) return;
      if (evt.data === "close") {
        hideZW();
      }
      if (evt.data === "ifc:error") {
        logger("iframe error!");
      }
      if (evt.data === "ifc:ready") {
        handleIfcReady(instance.widgetId);
      }
      logger("**************** sdk ******************");
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

      this.customerExternalId = initConfig.customerExternalId || null;
      this.customerEmail = initConfig.customerEmail || null;
      this.customerPhone = initConfig.customerPhone || null;

      this.customerHash = initConfig.customerHash || null;

      const hasCustomerIdentifier =
        !!this.customerExternalId ||
        !!this.customerEmail ||
        !!this.customerPhone;

      if (hasCustomerIdentifier && !this.customerHash) {
        throw new Error(
          "Invalid configuration. customerHash is required when customerExternalId, customerEmail, customerPhone are provided."
        );
      } else if (!hasCustomerIdentifier && this.customerHash) {
        throw new Error(
          "Invalid configuration. customerHash is required when customerExternalId, customerEmail, customerPhone are not provided."
        );
      }

      fetchWidgetConfig(this.widgetId)
        .then((c) => {
          logger("fetched widget config", c);
          config = c;
        })
        .then(() => {
          logger("configure widget store...");
          const storage: ZygSDKStorage = {
            widgetId: this.widgetId as string,
          };

          // order of conditions matters.
          // if customerExternalId is set, it takes precedence over customerEmail and customerPhone.
          if (this.customerExternalId) {
            storage.customerExternalId = this.customerExternalId;
          } else if (this.customerEmail) {
            storage.customerEmail = this.customerEmail;
          } else if (this.customerPhone) {
            storage.customerPhone = this.customerPhone;
          }

          if (this.customerHash) {
            storage.customerHash = this.customerHash;
          } else {
            // customer is anonymous
            // use anonId to track anonymous sessions
            const anonId = generateUUID();
            storage.anonId = anonId;
          }

          const isStored = setLocalStorage(
            this.widgetId as string,
            JSON.stringify(storage)
          );

          if (!isStored) {
            throw new Error("Error storing widget store in localStorage.");
          }
        })
        .then(() => {
          logger("create iframe widget...");
          createZygWidget(config),
            window.addEventListener("message", this.onMessageHandler),
            window.addEventListener("resize", handlePageWidthChange);
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
