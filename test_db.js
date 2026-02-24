import { cmsService } from './services/cmsService.js';
console.log(await cmsService.getPosts('published'));
