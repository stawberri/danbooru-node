# danbooru-node
danbooru api wrapper

[![NPM](https://nodei.co/npm/danbooru.png?mini=true)](https://nodei.co/npm/danbooru/)
[![Build Status](https://travis-ci.org/stawberri/danbooru-node.svg?branch=master)](https://travis-ci.org/stawberri/danbooru-node)

My api wrapper is super simple! First, you require it:
```javascript
var Danbooru = require('danbooru');
```

Then you just refer to [Danbooru's lovely api documentation](https://danbooru.donmai.us/wiki_pages/43568) and make requests!

## Making requests

```javascript
Danbooru.get('posts', {limit: 5, tags: 'cat_ears'}, function(err, data) {
    if(err) throw err;
    console.log(data); // All of your cute kittehgirls!
});
```

You can also use `Danbooru.post()`, `Danbooru.put()`, and `Danbooru.delete()`. They all have the same parameters and give you the same callback!

### Danbooru.method([path], [params], [callback])
Perform a http request on Danbooru's api!
* `method` _property_. One of `get`, `post`, `put`, or `delete`, depending on what type of request you would like to make.
* `path` _string_. The API documentation mentions a base URL. You put that here! The slash and `.json` are optional. In fact, the entire thing is optional, but you won't get anything useful from omitting path.
* `params` _object_. Just provide your parameters as an object!
* `callback` _function(err, data)_. What do you wannya do after you get your api request?
    - `err` _Error_. Node.js callbacks always give you an error for some reason. Here you go!
    - `data` _object_. Parsing JSON output is an extra step, so you don't hafta do it! Here's an already-parsed object for you!

### Danbooru.request([options], [callback])
A simple wrapper function for [request](https://www.npmjs.com/package/request), with `baseUrl` always set to Danbooru. Refer to [their documentation](https://www.npmjs.com/package/request#requestoptions-callback) for details.
* `options` _string_. _object_. A url or options for your request.
* `callback` _function(err, response, body)_. Callback function. `response` is a usual node HTTP response, while `body` is the body of that response, ready for using.
* **returns** _request_. Request object.

I'm providing this to give you an easy way to download images and make custom requests without having to type Danbooru's url:

```javascript
Danbooru.request('/data/9b5d16968321eff393fea8d735d69de3.jpg')
        .pipe(fs.create-write-stream('cutiefox.jpg'));
```

## Authentication
You know what's a pain? Having to type the same stuff over and over again. You know what you hafta do if you want to be authenticated on Danbooru? Send your `login` and `api_key` over and over again.

```javascript
var authedBooru = new Danbooru({login: 'topsecret', api_key: 'evenmoresecret'});
authedBooru.post('favorites', {post_id: 2288637}, function(err, data) {
    if(err) throw err;
    console.log('Successfully favorited!'); // Wow, you do like kittehgirls!
});
```

If that's still too much typing for you, you can use a shortcut!
```javascript
var shortBooru = Danbooru('topsecret', 'evenmoresecret');
```

### [new] Danbooru([object], [api_key])
Save parameters for later. Returns a new Danbooru object that you can use to make requests with those saved parameters.
* `object` _object_. _string_. If you provide an object, it'll be used as default parameters for all requests you make! If you provide a string, it'll set your default `login` parameter to whatever you provide! If you provide neither, you'll create a new, empty `Danbooru` object.
* `api_key` _string_. If (and only if) you provided a string for `object`, this will be used as your default `api_key` parameter!

## Searching

"But wait," you say, "APIs are supposed to help make my life easier! Why do I still have to type so much?" Well, I made a helper function called `.search()` for you, and as a bonus, its data object even gives you extra helper functions to get around more easily! The helper functions are also returned by `.search()`, so you can chain more nicely!

```javascript
Danbooru.search('1girl fox_ears', function(err, page1) {
    if(err) throw err;
    console.log(page1); // Foxgirls!
}).next(function(err, page2) {
    if(err) throw err;
    console.log(page2); // More foxgirls!
    page2.next(function(err, page3) {
        if(err) throw err;
        console.log(page3); // So many foxgirls~ ♥
    });
});
```

### Danbooru.search([tags], [params], [callback])
Perform a search on Danbooru. A shortcut for `Danbooru.get('posts', {tags: tags, limit: 100, ...params}, callback)`, but also adds on extra methods to the data object you get. Visit [an api result](https://danbooru.donmai.us/posts.json?tags=fox_ears&limit=2) in your browser to inspect the data object provided.
* `tags` _string_. A space separated list of tags, and basically your Danbooru search query. You can try out your query visually on [Danbooru](https://danbooru.donmai.us/) or look up their [searching reference](https://danbooru.donmai.us/wiki_pages/43049) if you're not sure what to type.
* `params` _object_. These are just parameters that will be directly passed to Danbooru's API. It will contain `limit: 100`
by default, but you can change the number of posts you want by specifying it. Trying to specify `tags` won't do anything, because the `tags` parameter always overwrites the value of `tags` here, even if `tags` is empty or missing (which makes it default to empty).
* `callback` _function(err, searchData)_ Do something after your request comes back.
    - `err` _Error_. Like always, an error object if there was one.
    - `searchData` _object_. Whatever Danbooru's API returns, but with some extra methods and properties. More details below!
* **returns** _object_. Contains only my extra helper methods and properties from `searchData`. Also details below~

### Danbooru.search -> [callback] -> data
Like I've said probably three times already, this data object is the one that Danbooru's api gives you, but with some nice helper functions! You can see sample API output by [visiting Danbooru](https://danbooru.donmai.us/posts.json?tags=fox_ears&limit=2). I haven't told you what the methods are yet, so~

#### searchData.page
This is a property that tells you what your current page number is. You can't change it.

#### searchData.load([page], [callback])
Calls `Danbooru.search()` again with the same tags and parameters as last time, but with the page of results you want! Trying to load a page number less than 1 will just set it to 1.
* `page` _number_. What page of results would you like? Defaults to your current page, so you can actually use `searchData.load(callback)` to refresh your data.
* `callback` _function(err, searchData)_. This literally gives you the same type of object as the `searchData` you're currently looking at.

#### searchData.next([modifier], [callback])
Calls `searchData.load(this.page + modifier, callback)`, which basically increases your page number by your specified modifier. This will usually give you older posts (unless you specify a negative modifier for some reason).
* `modifier` _number_. What number would you like to increment your page number by?
* `callback` _function(err, searchData)_. Same as above.

#### searchData.prev([modifier], [callback])
Calls `searchData.load(this.page - modifier, callback)`, which basically decreases your page number by your specified modifier. This will usually give you newer posts (unless you specify a negative modifier for some reason).
* `modifier` _number_. What number would you like to decrement your page number by?
* `callback` _function(err, searchData)_. Same as above.

#### searchData.tags
This is a property that tells you what tags your search is currently for. You can't change it.

#### searchData.add([tagMod], [callback])
Calls `Danbooru.search()` again with the same parameters as last time, but with your `tagMod` added to the end of your `tags` and `page` set back to 1.
* `tagMod` _string_. This basically just takes your current tags and then adds these tags to it. In other words, effectively `Danbooru.search(searchData.tags + " " + tagMod, params, callback)`.
* `callback` _function(err, searchData)_. Meow.

#### searchData.add([tagMod], [callback])
Calls `Danbooru.search()` again with the same parameters as last time, removing the tags in your `tagMod` from `tags` and `page` set back to 1.
* `tagMod` _string_. This list of tags is separated by spaces, and then any tags here are removed from your tags for your new search.
* `callback` _function(err, searchData)_. Nyaa.

#### searchData.random()
Gives you a random post from the set of posts you've found. Doesn't return anything when you don't have any posts.
* **returns** _object_. A random post from `searchData`.

### Danbooru.search -> posts
When you're searching, you're probably looking for posts. When you're looking for posts, you probably wannya make get requests to their image URLs to be able to use them. Rather than make you write `Danbooru.request(post.file_url)` over and over again, how about we make things simpler for you? This example uses `random`, but you could also just go to any valid index and it would still work.

```javascript
authedBooru.search('maid', function(err, data) {
    if(err) throw err;
    data.random().favorite(); // Favoriting a random maid~ H-how bold!
});
```

#### post.get([callback])
This does a get request to your post's `file_url`, which is usually your post's full size image. This also uses [request](https://www.npmjs.com/package/request), just like `Danbooru.request()`
* `callback` _function(err, response, body)_. Callback function. `response` is a usual node HTTP response, while `body` is your image data.
* **returns** _request_. Request object.

#### post.getLarge([callback])
This does a get request to your post's `large_file_url`, which is a large image appropriate for browsers, but not original size. It's sometimes the same image as `file_url`. This also uses [request](https://www.npmjs.com/package/request), just like `Danbooru.request()`
* `callback` _function(err, response, body)_. Callback function. `response` is a usual node HTTP response, while `body` is your image data.
* **returns** _request_. Request object.

#### post.getPreview([callback])
This does a get request to your post's `preview_file_url`, which is usually your post's tiny preview image, useful for thumbnails. This also uses [request](https://www.npmjs.com/package/request), just like `Danbooru.request()`
* `callback` _function(err, response, body)_. Callback function. `response` is a usual node HTTP response, while `body` is your image data.
* **returns** _request_. Request object.

#### post.favorite([yes], [callback])
This function only really works with an authenticated Danbooru object, but you can use it to quickly favorite or unfavorite a post!
* `yes` _boolean_. Defaults to yes. Pass `false` to perform an unfavorite instead.
* `callback` _function(err, data)_. It's a callback.
