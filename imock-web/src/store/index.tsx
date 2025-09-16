import { create } from 'zustand'
import { createJSONStorage,devtools, persist } from 'zustand/middleware'

import { getUserInfo } from '~/services/user'

export interface UserInfo {
    userId: string;
    phone: string;
    nickname: string;
    avatar: string | null;
    cancelled: boolean;
    verified: boolean;
    wxacode: string;
    isSetPassword: boolean;
    email: string;
}

interface UserState {
  userInfo?: UserInfo;
  setUserInfo: (userInfo: UserInfo) => void;
  clearUserInfo: () => void;
  refreshUserInfo: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    devtools(
        persist(
            set => ({
                userInfo: undefined,
                setUserInfo: userInfo => {
                    set({ userInfo })
                },
                clearUserInfo: () => {
                    set({ userInfo: undefined })
                },
                refreshUserInfo: async () => {
                    const userInfo = await getUserInfo()
                    set({ userInfo })
                }
            }),
            {
                name: 'user-storage',
                storage: createJSONStorage(() => sessionStorage),
            },
        ),
    ),
)
