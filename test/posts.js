const test = require('tape')
const Danbooru = require('..')

test('begin posts', t => {
  t.end()
})

test('post fetching', async t => {
  let booru = new Danbooru()
  let safe = new Danbooru.Safebooru()
  t.timeoutAfter(30000)

  await Promise.all([
    booru.posts().then(async posts => {
      t.true(Array.isArray(posts), 'returns an array')

      let post = await booru.posts.get(posts[0].id)
      t.equal(post.id, posts[0].id, 'returns individual posts')
    }),
    booru.posts('animal_ears').then(async posts => {
      t.true(posts.every(post => post.tags.includes('animal_ears')), 'searches for tags')

      let post = await booru.posts.get(posts[0])
      t.equal(post.id, posts[0].id, 'can be used instead of ids')
    }),
    booru.posts(['animal_ears', '1girl']).then(posts =>
      t.true(posts.every(post => {
        return (
          post.tags.includes('animal_ears') &&
          post.tags.includes('1girl')
        )
      }), 'supports tag arrays')
    ),
    safe.posts('1girl original').then(posts => {
      let hasRatings = true
      let hasLockStatus = true
      for(let post of posts) {
        hasRatings = hasRatings && post.rating.s

        hasLockStatus =
          hasLockStatus &&
          (typeof post.rating.locked === 'boolean')
      }
      t.true(hasRatings, 'has ratings')
      t.true(hasLockStatus, 'has rating lock status')
    }),
    booru.posts({
      random: true,
      page: 3,
      limit: 100,
      tags: 'status:active filesize:..200kb'
    }).then(async posts => {
      let downloadFile

      let prblm = {
        md5: false, width: false, height: false, name: false, ext: false,
        extMatch: false, size: false, large: false, ndownload: false,
        nname: false, next: false, nmd5: false
      }
      for(let post of posts) {
        let file = post.file
        if('request' in file) {
          prblm.downloadFile = prblm.file
          prblm.md5 = prblm.md5 || typeof file.md5 !== 'string'
          prblm.width = prblm.width || typeof file.width !== 'number'
          prblm.height = prblm.height || typeof file.height !== 'number'
          prblm.name = prblm.name || typeof file.name !== 'string'
          prblm.ext = prblm.ext || typeof file.ext !== 'string'
          prblm.extMatch = prblm.extMatch || file.ext !== post.raw.file_ext
          prblm.size = prblm.size || typeof file.size !== 'number'
          prblm.large = prblm.large || 'large' in file !== post.raw.has_large
        } else {
          prblm.ndownload = prblm.ndownload || 'download' in file
          prblm.nname = prblm.nname || 'name' in file
          prblm.next = prblm.next || 'ext' in file
          prblm.nmd5 = prblm.nmd5 || 'md5' in file
        }
      }
      t.false(prblm.md5, 'has md5 as a string')
      t.false(prblm.width, 'has width as a number')
      t.false(prblm.height, 'has height as a number')
      t.false(prblm.name, 'has name as a string')
      t.false(prblm.ext, 'has ext as a string')
      t.false(prblm.extMatch, 'has correct extension')
      t.false(prblm.size, 'has size as a number')
      t.false(prblm.large, 'has matching large existence')
      t.false(prblm.ndownload, 'does not have download')
      t.false(prblm.nname, 'does not have name')
      t.false(prblm.next, 'does not have ext')
      t.false(prblm.nmd5, 'does not have md5')

      if(downloadFile) {
        t.doesNotThrow(() => {
          downloadFile.preview.download()
        }, 'downloads preview successfully')

        let download = downloadFile.download()

        t.doesNotThrow(() => {
          download = download.data(() => {})
        }, 'exposes progress function')

        let buffer = await download
        t.equal(buffer.length, downloadFile.size, 'downloads correct size file')
      }
    }),
    booru.posts({
      random: true,
      limit: 100,
      tags: 'status:active filesize:5mb..'
    }).then(async posts => {
      let post = posts.find(post => 'request' in post.file)
      if(!post) {
        t.fail('did not give a downloadable file to test abort with')
        return
      }

      let file = post.file

      t.true(file.size >= 5e+6, 'gives files of expected size')

      let progressReports = 0
      let continued = false
      let timeout
      let error = await new Promise(resolve => {
        let download = file.download()

        download.then(() => {
          t.fail('completed download during abort test')
        }, err => resolve(err))

        download.data((progress, total) => {
          progressReports++
          if(continued) t.fail('continued download during abort test')
          if((progress / total) > 0.05) download.abort()
        })

        timeout = setTimeout(() => download.abort(), 500)
      })
      continued = true

      t.true(progressReports > 0, 'sends progress reports')
      t.equal(
        error.message, 'download aborted by user',
        'throws correct error'
      )
    })
  ]).catch(e => t.error(e))

  t.end()
})

test('end posts', t => {
  t.end()
})
