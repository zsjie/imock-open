// 创建一个工具类，用于定义所有请求的响应类型
export interface VO<T> {
  code: number
  data: T
}

export interface UserInfoBo {
  channel: string;
  token: string;
  permissions: {
    id: string;
    code: string;
    name: string;
    dns: string;
    sort: number;
    menus: any[];
    buttons: any[];
    apis: any[];
    workbenches: any[];
    link?: string | null;
  }[];
  user: {
    avatar: string;
    bindShopCode: string;
    createdDate: string;
    email: string;
    employeeNo: string;
    employeeType: number;
    enterpriseId: number;
    gender: number;
    joinDate: string;
    lastLoginDate: string;
    mobile: string;
    name: string;
    shopAuth: boolean;
    openDepartmentIds: string;
    resignStatus: number;
    updatedTs: string;
    userId: string;
  };
}
export interface UpdateApiMockParams {
  id?: number;
  name?: string;
  url: string;
  method: string;
  status: string;
  body: string;
  headers: string;
  delay?: number;
}

export type UpdateApiMockResp = object

export interface GetApiMockListParams {
  url: string;
  method: string;
}

export interface ApiMockItem {
  id: number;
  name: string;
  url: string;
  method: string;
  statusCode: string;
  body: string;
  headers: string;
  running: number;
  delay?: number;
}

export interface DeleteApiMockResp {
  id: number;
}

export interface GenerateBySchemaResp {
  result: any;
}

export interface GetApiMockListResp {
  hasMore: boolean;
  mocks: ApiMockItem[];
  offset: number;
}

export interface SetMockUrlParams {
  urls: {
    url: string;
    env: string;
  }[]
}

export type SetMockUrlResp = object

export interface ListMockUrlResp {
  urls: {
    url: string;
    env: string;
    running: boolean;
  }[]
}




export interface ShareRequestResp {
  shareId: string
  expiredAt: string
  shareUrl: string
}

export interface ShareData {
  method: string;
  status: string;
  url: string;
  requestBody?: ObjectAny;
  responseBody: ObjectAny;
  requestHeaders?: ObjectAny;
  responseHeaders: ObjectAny;
  requestTime?: number;
  responseTime?: number;
}

