# ハンズオン: テレメトリデータを受け付ける REST API を作成する（Azure Functions）

## 大まかな流れ

- [Azure ポータルで Azure Functions のリソースを作成する](#azure-ポータルで-azure-functions-のリソースを作成する)
- [Azure Functions の App settings に Event Hub の接続文字列を設定する](#azure-functions-の-app-settings-に-event-hub-の接続文字列を設定する)
- [コードを準備する](#コードを準備する)
- [Azure Function app にデプロイする](#azure-function-app-にデプロイする)
- [Azure Time Series Insights でテレメトリの受信を確認する](#azure-time-series-insights-でテレメトリの受信を確認する)

## Azure ポータルで Azure Functions のリソースを作成する

Azure ポータル（ https://portal.azure.com ）で、前項で作成したリソースグループを開きます。

リソースグループ内の「+ Create」からリソースの作成に進み、「Function App」の「Create」を選択します。

#### 「Basics」タブ

| 項目 | 説明 |
|----|----|
| Project Details | |
| - Subscription | 利用するサブスクリプションを指定する |
| - Resource Group | 利用するリソースグループを指定する |
| Instance Details | |
| - Function App name | Function App の名前（ `func-` で始まる文字列）を入力する |
| - Publish | 「Code」を選択する |
| - Runtime stack | 「Node.js」を選択する |
| - Version | 「14 LTS」を選択する |
| - Region | 最寄りのリージョン（「Japan East」など）を選択する | 

#### 「Hosting」タブ

| 項目 | 説明 |
|----|----|
| Storage | |
| - Storage account | 「Create new」から、ストレージアカウントの名前（ `st` で始まる文字列）を入力する |
| Operating system | |
| - Operating System | 「Windows」を選択する |
| Plan | |
| - Plan type | 「Consumption (Serverless)」を選択する |

#### 「Networking (preview)」タブ

変更はありません。

#### 「Monitoring」タブ

| 項目 | 説明 |
|----|----|
| Application Insights | |
| - Enable Application Insights | 「Yes」を選択する |
| - Application Insights | 「Create new」から、「Name」に Application Insights の名前（ `appi-` で始まる文字列）を、「Location」に Azure Functions と同じリージョンを指定し、「OK」を選択する |

ここまで入力できたら、「Review + create」を選択して入力内容を確認し、「Create」を選択してリソースの作成を開始します。

リソースの作成が完了したら、「Go to resource」ボタンから作成した Function App の画面に遷移します。

## Azure Functions の App settings に Event Hub の接続文字列を設定する

まず、前項で作成した IoT Hub で、**作成したデバイスの接続文字列** を取得します。

つぎに、Function App の「Settings」の「Configuration」を開き、「Application settings」タブで「+ New application setting」を選択します。それぞれ項目を入力したら、「OK」を選択して追加していきます。

| 項目 | 説明 |
|----|----|
| Name | `EVENTHUB_CONNECTION_STRING` と入力する |
| Value | Event Hub の作成したポリシーの接続文字列を入力する |

| 項目 | 説明 |
|----|----|
| Name | `WEBSITE_RUN_FROM_PACKAGE` と入力する |
| Value | `1` を入力する |

それぞれ入力できたら、必ず、画面上部の「Save」を選択し、保存してください。

## コードを準備する

Azure Functions のコードの実装はさまざまな方法がありますが、ここでは [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools) を利用します。詳細は下記をご参考ください。

- [Azure Functions Core Tools の操作 | Microsoft Docs](https://docs.microsoft.com/ja-jp/azure/azure-functions/functions-run-local?tabs=v3%2Cwindows%2Ccsharp%2Cportal%2Cbash%2Ckeda)

ハンズオンでは、Azure ポータルの Cloud Shell を利用して作業を進めます。もしご自身の環境ですでに Azure Functions Core Tools の環境がそろっているようであれば、そちらで作業いただいても構いません。

それでは、Azure ポータルの上部にある「Cloud Shell」アイコンを選択して、Cloud Shell を開きましょう。初回は、ストレージの設定などを促されるので、指示に従って完了させてください。

シェルが起動したら、下記のコマンドを実行して Azure Functions Core Tools が利用できることを確認してみます。

```bash
func -v
```

それでは、まずプロジェクトを作成しましょう。ここでは、Node.js を利用します。

```bash
mkdir azure-functions
cd azure-functions
func init --worker-runtime node --language javascript
```

つぎに、HTTP トリガで呼び出される関数を作成します。

```bash
func new --language javascript --template "HTTP trigger" --authlevel anonymous --name telemetry-receiver
```

この状態で、ローカル（この場合は Cloud Shell）で Function App を実行してみましょう。下記コマンドを実行すると、 `http://localhost:7071/api/telemetry-receiver` として関数が動作していることがわかります。（ Cloud Shell 上でこの API の動作確認をしたい方は、「Open new session」で別のセッションを開くとよいでしょう。）

```bash
func start
```

Ctrl + C キーでプロセスを停止します。

それでは、IoT Hub にテレメトリを送信する処理を作成しましょう。

下記のように `code` コマンドを実行し、Cloud Shell 上でエディタを立上げ、コードを編集します。

```bash
code .
```

それぞれのファイルを下記のコードで置き換えてください。

#### `telemetry-receiver/function.json`

```json
{
  "bindings": [
    {
      "authLevel": "Anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    },
    {
      "type": "eventHub",
      "name": "outputEventHubMessage",
      "eventHubName": "myeventhub",
      "connection": "EVENTHUB_CONNECTION_STRING",
      "direction": "out"
    }
  ]
}
```

#### `telemetry-receiver/index.js`

```js
module.exports = async function (context, req) {
  const deviceId = req.query.device_id;
  const score = parseInt(req.body.score);
  const telemetry = { deviceId, score };

  context.log('telemetry: ', JSON.stringify(telemetry));
  context.bindings.outputEventHubMessage = telemetry;
}
```

#### `local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "EVENTHUB_CONNECTION_STRING": "<Azure Event Hub の接続文字列>"
  }
}
```

```bash
func start
```

```bash
curl -X POST -d "{\"score\": 80}" http://localhost:7071/api/telemetry-receiver?device_id=func-from-local
```

# Azure Function app にデプロイする

```bash
# 現在、ターミナル上でログインしているサブスクリプションを確認する
az account show

# ログインしていない場合はログインする
az login

# ログインしているサブスクリプション一覧を表示する
az account list

# 利用するサブスクリプションの id を指定して切替える
az account set -s <Subscription id>
```

```bash
# コードをZipでアーカイブする
zip -r app.zip .

# Azure Function app にデプロイする
az functionapp deployment source config-zip -g <Resource group name> -n <Function app name> --src app.zip

# Zipアーカイブを削除する
rm app.zip
```

## Azure Time Series Insights でテレメトリの受信を確認する

デプロイした Azure Function app のエンドポイントを実行してみましょう。

```bash
curl -X POST -d "{\"score\": 120}" https://<Function app name>.azurewebsites.net/api/telemetry-receiver?device_id=func-registered
```
