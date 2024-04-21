// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportExample from '../../../app/controller/example';

declare module 'egg' {
  interface IController {
    example: ExportExample;
  }
}
