// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportExample from '../../../app/controller/example';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    example: ExportExample;
    user: ExportUser;
  }
}
