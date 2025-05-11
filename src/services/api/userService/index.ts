
// This file re-exports all user service functionality
// to maintain backward compatibility with existing imports

import { syncAuthUser, getUsers } from './syncUser';
import { getCurrentUser } from './getCurrentUser';
import { logoutUser } from './authUtils';

export { syncAuthUser, getUsers, getCurrentUser, logoutUser };
