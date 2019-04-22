import { initializeIcons } from '@uifabric/icons';
import 'jest-dom/extend-expect';
import { cleanup } from 'react-testing-library';

initializeIcons();

afterEach(cleanup);
