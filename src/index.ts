import {
    type ClientChannel,
    type ConnectConfig,
    type ExecOptions,
    type SFTPWrapper,
    Client as Ssh2Client,
    type Stats,
    type TransferOptions,
} from 'ssh2'

class Client {
    sftpSession?: SFTPWrapper
    ssh2: Ssh2Client

    constructor() {
        this.ssh2 = new Ssh2Client()
    }

    async chmod(path: string, mode: number | string): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.chmod(path, mode, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async chown(path: string, uid: number, gid: number): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.chown(path, uid, gid, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    connect(config: ConnectConfig): Promise<Client> {
        return new Promise((resolve, reject) => {
            this.ssh2
                .on('ready', () => {
                    resolve(this)
                })
                .on('error', (err) => {
                    reject(new Error(`Connection error: ${err.message}`))
                })
                .on('timeout', () => {
                    reject(new Error('Connection timed out'))
                })
                .connect(config)
        })
    }

    end() {
        return this.ssh2.end()
    }

    exec(command: string, options: ExecOptions = {}): Promise<ClientChannel> {
        return new Promise((resolve, reject) => {
            this.ssh2.exec(command, options, (err, channel) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(channel)
                }
            })
        })
    }

    async fastGet(remotePath: string, localPath: string, options: TransferOptions = {}): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.fastGet(remotePath, localPath, options, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async fastPut(localPath: string, remotePath: string, options: TransferOptions = {}): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.fastPut(localPath, remotePath, options, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    async mkdir(path: string): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.mkdir(path, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    sftp(): Promise<SFTPWrapper> {
        if (this.sftpSession) {
            return Promise.resolve(this.sftpSession)
        }

        return new Promise((resolve, reject) => {
            this.ssh2.sftp((err, sftp) => {
                if (err) {
                    reject(err)
                } else {
                    this.sftpSession = sftp
                    resolve(sftp)
                }
            })
        })
    }

    async stat(path: string): Promise<Stats> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.stat(path, (err, stats) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(stats)
                }
            })
        })
    }
}

export { Client }

export type { ClientChannel, ConnectConfig, ExecOptions, SFTPWrapper, Stats, TransferOptions }

export default Client
