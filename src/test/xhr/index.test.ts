import Duck from "../..";
import { Config, DuckHook } from "../../types";

// @vitest-environment jsdom


 export const articlesURL = 'http://localhost:3000/api/articles'
 export const articlesPosts = [
   {
     userId: 1,
     id: 1,
     title: 'first post title',
     body: 'first post body',
   }
 ]

export const hooks: DuckHook.List = {
    onRequest: (e) => {
    },

    onResponse: (e) => {
    },

    onDownload: () => {

    },

    onUploadProgress: () => {

    },

    onUploaded: () => {

    },

    onError: () => {
    }
}

export const config: Config = {
    baseURL: articlesURL,
    hooks: hooks
}
export const duckd = new Duck(config)




