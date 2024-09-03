import { typeid } from 'typeid-js';
import { ModelPrefix } from './constants/id-prefixes';

export function id(model: keyof typeof ModelPrefix): string {
	return typeid(ModelPrefix[model]).toString();
}
