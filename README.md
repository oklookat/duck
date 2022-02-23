# README WORK IN PROGRESS
# Duck: XHR wrapper

**I need something small and powerful for making XHR requests in my web app. And here is it — Duck.**

## What was important to me
1. [Easy configuration](#Easy-configuration)
2. [Hooks](#Hooks)
3. [Automatic Content-Type/Response body parsing](#Automatic-Content-Type-Response-body-parsing)
5. Request cancellation
6. Full TypeScript types support
7. Independence from huge packages like Axios
8. Modern code without legacy
~~9. npm package with funny name~~

## Easy configuration
*Or no configuration at all.*

i donthaveatime for configs!!1!! I need to send request!!! NOW!!1 
Well, ok:
```javascript
import Duckd from "@oklookat/duck"
const Duck = new Duckd()
Duck.GET({  url: "https://example.com/api/v1/articles" })
	.then(response => {
		const articles = response.body
	})
```

Hmm... Wait. I think i need some settings.
Ok, well:
```javascript
import Duckd from "@oklookat/duck"

const config = {
	timeout: 15000,
	withCredentials: true,
	baseURL: "https://example.com/api/v1/"
}

const Duck = new Duckd(config)

Duck.GET({  url: "articles", params: { show: "published" } })
	.then(response => {
		const articles = response.body
	})
```


## Hooks
In my app i have notification system, and i want to send notification if we have an error while request. 

And i have progress bar, which displaying request progress. I want to use it.

How i can do it? **Hooks**! Let's continue previous example:
```javascript
import Duckd from "@oklookat/duck"

const Hooks = {
	onRequest(r) {
		window.$anotherProgressPlugin.start()
	},

	onResponse() {
		window.$anotherProgressPlugin.finish()
	},

	onError(err) {
		window.$anotherProgressPlugin.finish()
		AnotherErrorHandler.handle(err)
	},

	onUploadProgress(e) {
		// no Content-Length
		if (!e.data.lengthComputable) {
			return
		}
		const percents = (e.data.loaded / e.data.total) * 100
		window.$anotherProgressPlugin.percents = percents
	}
}

const config = {
	timeout: 15000,
	withCredentials: true,
	baseURL: "https://example.com/api/v1/",
	hooks: Hooks
}

const Duck = new Duckd(config)

Duck.GET({  url: "articles", params: { show: "published" } })
	.then(response => {
		const articles = response.body
	})
```
Cool! Now all my dreams is real!

## Btw
Many settings (like hooks) you can use locally, for every single request. 
```javascript
Duck.GET(LOCAL_CONFIG_OBJECT)
```

In case with hooks (if you have global and local), first executing global, then local.
For more information about global/request config and other stuff [see types.d.ts file](https://github.com/oklookat/duck/blob/main/src/types.d.ts)

## Automatic Content-Type/Response body parsing

#### Content-Type
If i send object, XHR wrapper need to set request header:
*Content-Type: application/json*

Or URLSearchParams:
*Content-Type: application/x-www-form-urlencoded*

Duck does it.

#### Reponse body parsing
In short: if response body is a JSON string, XHR wrapper need to parse this string to object.

Duck does it.
