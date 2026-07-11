import {
    type ClientChannel,
    type ConnectConfig,
    type ExecOptions,
    type ReadStream,
    type ReadStreamOptions,
    type SFTPWrapper,
    Client as Ssh2Client,
    type Stats,
    type TransferOptions,
    utils,
    type WriteStream,
    type WriteStreamOptions,
} from 'ssh2'

type ExecResult = {
    code?: number
    signal?: string
    stderr: string
    stdout: string
}

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

    async createReadStream(path: string, options: ReadStreamOptions = {}): Promise<ReadStream> {
        const sftp = await this.sftp()

        return sftp.createReadStream(path, options)
    }

    async createWriteStream(path: string, options: WriteStreamOptions = {}): Promise<WriteStream> {
        const sftp = await this.sftp()

        return sftp.createWriteStream(path, options)
    }

    end() {
        return this.ssh2.end()
    }

    async exec(command: string, options: ExecOptions = {}): Promise<ExecResult> {
        const channel = await new Promise<ClientChannel>((resolve, reject) => {
            this.ssh2.exec(command, options, (err, ch) => {
                if (err) reject(err)
                else resolve(ch)
            })
        })

        const stdoutChunks: Buffer[] = []
        const stderrChunks: Buffer[] = []

        function onStdoutData(chunk: Buffer) {
            stdoutChunks.push(chunk)
        }

        function onStderrData(chunk: Buffer) {
            stderrChunks.push(chunk)
        }

        function cleanup() {
            channel.off('data', onStdoutData)
            channel.stderr.off('data', onStderrData)
        }

        return new Promise((resolve, reject) => {
            channel.on('data', onStdoutData)
            channel.stderr.on('data', onStderrData)
            channel.once('close', (code?: number, signal?: string) => {
                cleanup()
                resolve({
                    code,
                    signal,
                    stderr: Buffer.concat(stderrChunks).toString('utf8'),
                    stdout: Buffer.concat(stdoutChunks).toString('utf8'),
                })
            })
            channel.once('error', (...args: unknown[]) => {
                cleanup()
                reject(...args)
            })
        })
    }

    async exists(path: string): Promise<void> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.exists(path, (hasError) => {
                if (hasError) {
                    reject()
                } else {
                    resolve()
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

    async realpath(path: string): Promise<string> {
        const sftp = await this.sftp()

        return new Promise((resolve, reject) => {
            sftp.realpath(path, (err, absPath) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(absPath)
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

export { Client, utils }

export type {
    ClientChannel,
    ConnectConfig,
    ExecOptions,
    ExecResult,
    ReadStream,
    ReadStreamOptions,
    SFTPWrapper,
    Stats,
    TransferOptions,
    WriteStream,
    WriteStreamOptions,
}

export default Client
