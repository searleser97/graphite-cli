import "isomorphic-fetch";
import * as pathToRegexp from "path-to-regexp";
import * as t from "../retype";
import { TRoute } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function serializeURLArgs(obj: { [index: string]: any }): string {
  const str = [];
  for (const p in obj) {
    const v = obj[p];
    if (v !== undefined) {
      /**
       * TODO (tomasreimers): This will fail on any non-string types.
       * When that becomes an issue we'll update it to do some form of
       * serialization. For now, GET requests are really ONLY using
       * string params
       */
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

export function endpointWithArgs<TActualRoute extends TRoute>(
  apiServer: string,
  route: TActualRoute & {
    // only accept gets (posts/put/delete may require you to have data in the body, and I don't trust the caller to remember to do that)
    method: "GET";
  },
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>
): string {
  // Inspired by https://github.com/ReactTraining/react-router/blob/ea44618e68f6a112e48404b2ea0da3e207daf4f0/packages/react-router/modules/generatePath.js
  const path = urlParams
    ? pathToRegexp.compile(route.url)(urlParams)
    : route.url;
  let url = apiServer + path;

  if (queryParams) {
    const urlArgs = serializeURLArgs(queryParams);
    if (urlArgs != "") {
      url += "?" + urlArgs;
    }
  }

  return url;
}

function request(
  url: string,
  verb: string,
  headers: RequestInit["headers"],
  body: Buffer | string | null
): Promise<Response> {
  return fetch(url, {
    method: verb,
    mode: "cors",
    credentials: "include",
    headers: headers,
    ...(body ? { body: body } : {}),
  });
}

export function formatReqDetails<TActualRoute extends TRoute>(
  apiServer: string,
  route: TActualRoute,
  params: TActualRoute["rawBody"] extends true
    ? Buffer
    : t.UnwrapSchemaMap<TActualRoute["params"]>,
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>,
  headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>
): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
} {
  // Inspired by https://github.com/ReactTraining/react-router/blob/ea44618e68f6a112e48404b2ea0da3e207daf4f0/packages/react-router/modules/generatePath.js
  const path = urlParams
    ? pathToRegexp.compile(route.url)(urlParams)
    : route.url;
  let url = apiServer + path;
  let body: Buffer | string | null = null;

  if (route.method == "GET") {
    if (queryParams) {
      const urlArgs = serializeURLArgs(queryParams);
      if (urlArgs != "") {
        url += "?" + urlArgs;
      }
    }
  } else {
    body = route.rawBody ? (params as Buffer) : JSON.stringify(params);
  }

  return {
    url,
    method: route.method,
    headers: {
      ...headers,
      "Content-Type": "text/plain",
    } as Record<string, string>,
    body,
  };
}

export function requestWithArgs<TActualRoute extends TRoute>(
  apiServer: string,
  route: TActualRoute,
  params: TActualRoute["rawBody"] extends true
    ? Buffer
    : t.UnwrapSchemaMap<TActualRoute["params"]>,
  queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>,
  urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>,
  headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>
): Promise<
  t.UnwrapSchemaMap<TActualRoute["response"]> & { _response: Response }
> {
  const reqDetails = formatReqDetails(
    apiServer,
    route,
    params,
    queryParams,
    urlParams,
    headers
  );
  return request(
    reqDetails.url,
    reqDetails.method,
    reqDetails.headers,
    reqDetails.body
  ).then((response) => {
    // if there is supposed to be a response type, parse it
    if (!!route.response && response.status === 200) {
      return response.json().then((body: any) => {
        return {
          ...body,
          _response: response,
        };
      });
    }

    return { _response: response };
  });
}
