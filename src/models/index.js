import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuid4 } from 'uuid';
import slugify from 'slugify';
import config from '../config.js';