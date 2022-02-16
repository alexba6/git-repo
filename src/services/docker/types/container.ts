export type ContainerPortType =
      'tcp'
    | 'udp'
    | 'sctp'

export type ContainerHealthStatus =
      'none'
    | 'starting'
    | 'healthy'
    | 'unhealthy'

export type ContainerStatus =
      'created'
    | 'restarting'
    | 'running'
    | 'removing'
    | 'paused'
    | 'exited'
    | 'dead'

export type ContainerMountType =
      'bind'
    | 'volume'
    | 'tmpfs'
    | 'npipe'

export type ContainerMountBindOptionsPropagation =
      'private'
    | 'rprivate'
    | 'shared'
    | 'rshared'
    | 'slave'
    | 'rslave'

export type ContainerPorts = {
    Ip: string,
    PrivatePort: string,
    PublicPort: string,
    Type: ContainerPortType
}

export type ContainerHostConfig = {
    NetworkMode: string
}

export type ContainerNetworkSettings = {
    Networks: {
        [k in string]: any
    }
}

export type ContainerLog = {
    Start: string,
    End: string,
    ExitCode: number,
    Output: string
}

export type ContainerHeath = {
    Status: ContainerHealthStatus,
    FailingStreak: number,
    Log: ContainerLog[]
}

export type ContainerParams = {
    Id: string,
    Names: string[],
    Image: string,
    ImageID: string,
    Command: string,
    Created: number,
    Ports: ContainerPorts[],
    State: ContainerStatus,
    Status: string,
    SizeRw: number,
    SizeRootFs: number,
    Labels: {
        [k in string]: string
    },
    HostConfig: ContainerHostConfig,
    NetworkSettings: ContainerNetworkSettings
}


export type ContainerState = {
    Status: ContainerStatus,
    Running: boolean,
    Paused: boolean,
    Restarting: boolean,
    OomKilled: boolean,
    Dead: boolean,
    Pid: number,
    ExitCode: number,
    Error: string,
    StartedAt: string,
    FinishedAt: string,
    Health: ContainerHeath
}

export type ContainerMountConfig = {
    Type: string,
    Name: string,
    Source: string,
    Destination: string,
    Driver: string,
    Mode: string,
    RW: boolean,
    Propagation: string
}

export type ContainerMountAdvancedConfig = {
    Target: string,
    Source: string,
    Type: ContainerMountType,
    ReadOnly: boolean,
    Consistency: string,
    BindOptions: {
        Propagation: ContainerMountBindOptionsPropagation,
        NonRecursive: boolean
    },
    VolumeOptions: {
        NoCopy: boolean,
        Labels: any,
        DriverConfig: any
    },
    TmpfsOptions: any
}

export type ContainerHostDeviceConfig = {
    CpuShares: number,
    Memory: number,
    CgroupParent: string,
    BlkioWeight: number,
    BlkioWeightDevice: {
        Path: string,
        Weight: number
    }[],
    BlkioDeviceReadBps:  {
        Path: string,
        Rate: number
    }[],
    BlkioDeviceWriteBps:  {
        Path: string,
        Rate: number
    }[],
    BlkioDeviceReadIOps:  {
        Path: string,
        Rate: number
    }[],
    BlkioDeviceWriteIOps:  {
        Path: string,
        Rate: number
    }[],
    CpuPeriod: number,
    CpuQuota: number,
    CpuRealtimePeriod: number,
    CpuRealtimeRuntime: number,
    CpusetCpus: number,
    CpusetMems: number,
    Devices: any[],
    DeviceCgroupRules: string,
    DeviceRequests: any[],
    KernelMemory: number,
    KernelMemoryTCP: number,
    MemoryReservation: number,
    MemorySwap: number,
    MemorySwappiness: number,
    NanoCpus: number,
    OomKillDisable: boolean,
    Init: boolean | null,
    PidsLimit: number | null,
    Ulimits: {
        Name: string,
        Soft: number,
        Hard: number
    }[],
    CpuCount: number,
    CpuPercent: number,
    IOMaximumIOps: number,
    IOMaximumBandwidth: number,
    Binds: string[],
    ContainerIDFile: string,
    LogConfig: any,
    NetworkMode: string,
    PortBindings: {
        HostIp: string,
        HostPort: string
    }[],
    RestartPolicy: any,
    AutoRemove: boolean,
    VolumeDriver: string,
    VolumesFrom: string,
    Mounts: ContainerMountAdvancedConfig[],
    CapAdd: string[],
    CapDrop: string[],
    CgroupnsMode: 'private' | 'host',
    Dns: string[],
    DnsOptions: string[],
    DnsSearch: string[],
    ExtraHosts: string[],
    GroupAdd: string[],
    IpcMode: string,
    Cgroup: string,
    Links: string[],
    OomScoreAdj: number,
    PidMode: string,
    Privileged: boolean,
    PublishAllPorts: boolean,
    ReadonlyRootfs: boolean,
    SecurityOpt: string[],
    StorageOpt: any,
    Tmpfs: any,
    UTSMode: string,
    UsernsMode: string,
    ShmSize: number,
    Sysctls: any,
    Runtime: string,
    ConsoleSize: number,
    Isolation: string,
    MaskedPaths: string,
    ReadonlyPaths: string
}


export type ContainerAllParams = {
    Id: string,
    Created: string,
    Path: string,
    Args: string[],
    State: ContainerState,
    Image: string,
    ResolvConfPath: string,
    HostnamePath: string,
    HostsPath: string
    LogPath: string
    Name: string,
    RestartCount: number,
    Driver: string,
    Platform: string,
    MountLabel: string
    ProcessLabel: string
    AppArmorProfile: string,
    ExecIDs: string | null,
    HostConfig: ContainerHostDeviceConfig,
    GraphDriver: any,
    SizeRw: number,
    SizeRootFs: number,
    Mounts: ContainerMountConfig[]
}


