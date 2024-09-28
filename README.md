
<div align="center">
    <p align="center">
    <a href="https://www.zyg.ai">
        <h1 align="center">Zyg</h1>
    </a>
    <p align="center">
        Zyg is purpose-built customer support for your SaaS products.
        <br />
        <a href="https://www.zyg.ai">Website</a>
        ·
        <a href="https://x.com/_sanchitrk">X</a>
        ·
        <a href="https://github.com/zyghq/zyg/issues">Issues</a>
    </p>
    </p>
</div>

## ⚠️ Deprecated

This project is **deprecated** and no longer maintained. Please use [zyg-js](https://github.com/zyghq/zyg-js) for the updated version or alternative.


## Usage

### Enable Chat Widget

```html
<script>
  ZygSDK("init", {
    widgetId: "wg_cqdq05ctidu9511bvag0",
  });
</script>
```

### Enable Chat Widget with Customer Identity Verification

```html
<script>
  ZygSDK("init", {
    widgetId: "wg_cqdq05ctidu9511bvag0",
    customerEmail: "jonny@depp.com",
    customerHash: "lkahsodhflaskjdhfkahsdf-asndfkbn"
    traits: {
      name: "Jonny Depp",
    },
  });
</script>
```

#### Example Usage in a React Component

[view example](examples/with-react)

```jsx
import { useEffect } from "react";

declare global {
  interface Window {
    ZygSDK: any;
  }
}

function App() {
  useEffect(() => {
    window.ZygSDK("init", {
      widgetId: "wg_cqdq05ctidu9511bvag0",
      traits: {
        name: "Jonny Depp",
      },
    });
  }, []);

....
```
