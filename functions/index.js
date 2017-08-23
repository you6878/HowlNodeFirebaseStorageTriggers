// 'use strict';
//
// // [START import]
// const functions = require('firebase-functions');
// const gcs = require('@google-cloud/storage')();
// const spawn = require('child-process-promise').spawn;
// const path = require('path');
// const os = require('os');
// const fs = require('fs');
// // [END import]
//
// // [START generateThumbnail]
// /**
//  * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
//  * ImageMagick.
//  */
// // [START generateThumbnailTrigger]
// exports.generateThumbnail = functions.storage.object().onChange(event => {
// // [END generateThumbnailTrigger]
//     // [START eventAttributes]
//     const object = event.data; // The Storage object.
//
//     const fileBucket = object.bucket; // The Storage bucket that contains the file.
//     // Ex) howlcoding.appspot.com
//     const filePath = object.name; // File path in the bucket.
//     // Ex) image/test.png
//     const contentType = object.contentType; // File content type.
//     // Ex)image/png
//     const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
//     //Ex) exists
//     const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
//     //Ex) 1
//
//     // [START stopConditions]
//     // Exit if this is triggered on a file that is not an image.
//     if (!contentType.startsWith('image/')) { //이미지 체크하는 곳
//         console.log('This is not an image.');
//         return;
//     }
//
//     // Get the file name.
//     const fileName = path.basename(filePath);
//     // Exit if the image is already a thumbnail.
//     if (fileName.startsWith('thumb_')) {// thumb_로 시작하는 파일이 있는지 확인 하는 곳
//         console.log('Already a Thumbnail.');
//         return;
//     }
//
//     // Exit if this is a move or deletion event.
//     if (resourceState === 'not_exists') { //파일이 있는지 없는지 확인 (파일이 추가될때 exisits, 삭제될때 not_exists)
//         console.log('This is a deletion event.');
//         return;
//     }
//
//     // Exit if file exists but is not new and is only being triggered
//     // because of a metadata change.
//     if (resourceState === 'exists' && metageneration > 1) {
//         console.log('This is a metadata change event.');
//         return;
//     }
//     // [END stopConditions]
//
//     // [START thumbnailGeneration]
//     // Download file from bucket.
//     const bucket = gcs.bucket(fileBucket);
//     const tempFilePath = path.join(os.tmpdir(), fileName); // "os.tmpdir() : /tmp"
//     // /tmp/test.png
//     return bucket.file(filePath).download({
//         destination: tempFilePath
//     }).then(() => {
//         console.log('Image downloaded locally to', tempFilePath);
//         // Generate a thumbnail using ImageMagick.
//         return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
//     }).then(() => {
//         console.log('Thumbnail created at', tempFilePath);
//         /// tmp/test.png
//
//         const thumbFileName = `thumb_${fileName}`;
//         // thumb_test.png
//         const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
//         // image/thumb_test.png
//         return bucket.upload(tempFilePath, {destination: thumbFilePath});
//         // Once the thumbnail has been uploaded delete the local file to free up disk space.
//     }).then(() => fs.unlinkSync(tempFilePath)); //임시파일 삭제
//     // [END thumbnailGeneration]
// });

/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START import]
const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
// [END import]

// [START generateThumbnail]
/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 */
// [START generateThumbnailTrigger]
exports.generateThumbnail = functions.storage.object().onChange(event => {
// [END generateThumbnailTrigger]
    // [START eventAttributes]
    const object = event.data; // The Storage object.

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    //gs://howlcoding.appspot.com
    const filePath = object.name; // File path in the bucket.
    // /image/test.jpg
    const contentType = object.contentType; // File content type.
    // image/jpg,
    const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
    // exists, not_exists
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
    // [END eventAttributes]

    // [START stopConditions]
    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return;
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
        console.log('Already a Thumbnail.');
        return;
    }

    // Exit if this is a move or deletion event.
    if (resourceState === 'not_exists') {
        console.log('This is a deletion event.');
        return;
    }

    // Exit if file exists but is not new and is only being triggered
    // because of a metadata change.
    if (resourceState === 'exists' && metageneration > 1) {
        console.log('This is a metadata change event.');
        return;
    }
    // [END stopConditions]


    // [START thumbnailGeneration]
    // Download file from bucket.
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    //임시파일 생성
    return bucket.file(filePath).download({
        destination: tempFilePath
    }).then(() => {
        console.log('Image downloaded locally to', tempFilePath);
        // Generate a thumbnail using ImageMagick.
        return spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
    }).then(() => {
        console.log('Thumbnail created at', tempFilePath);
        // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
        const thumbFileName = `thumb_${fileName}`;
        const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
        // /image/thumb_test.jpg
        // Uploading the thumbnail.
        return bucket.upload(tempFilePath, {destination: thumbFilePath});
        // Once the thumbnail has been uploaded delete the local file to free up disk space.
    })
        .then(() => fs.unlinkSync(tempFilePath));
    // [END thumbnailGeneration]
});
// [END generateThumbnail]