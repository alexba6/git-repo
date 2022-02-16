

export type Image = {
    Id: string,
    ParentId: string,
    RepoTags: string[],
    RepoDigests: string[],
    Created: number,
    Size: number,
    SharedSize: number,
    VirtualSize: number,
    Labels: {
        [k in string]: string
    },
    Containers: number
}