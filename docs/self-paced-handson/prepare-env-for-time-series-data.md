# ハンズオン: 時系列データを扱う環境を構築する（Azure Event Hub, Azure Time Series Insights）

## 大まかな流れ

- [リソースグループを作成する](#リソースグループを作成する)
- [Azure Event Hub を作成する](#azure-event-hub-を作成する)
- [Azure Time Series Insights を作成する](#azure-time-series-insights-を作成する)
- [Azure Time Series Insights にモデルとインスタンスを追加する](#azure-time-series-insights-にモデルとインスタンスを追加する)

## リソースグループを作成する

Azure ポータル（ https://portal.azure.com ）を開き、リソースグループを作成します。

| 項目 | 説明 |
|----|----|
| Project Details | |
| - Subscription | 利用するサブスクリプションを指定する |
| - Resource Group | リソースグループの名前（ `rg-` で始まる文字列）を入力する |
| Resource Details | |
| - Region | 最寄りのリージョン（「Japan East」など）を選択する | 

入力できたら、「Review + create」を選択して入力内容を確認し、「Create」を選択してリソースの作成を開始します。

リソースグループの作成が完了したら、「Go to resource group」ボタンなどから作成したリソースグループの画面に遷移します。

## Azure Event Hub を作成する

Azure Event Hubs Namespace を作成する

Event Hub instance を作成する

Event Hub instance の「Settings」の「Shared access policies」を開き、「+ Add」から新しいポリシーを作成します。

| 項目 | 説明 |
|----|----|
| Policy name | 任意のポリシー名（ `fromFunc` など）を入力する |
| | 「Send」にチェックを付ける |

「Create」を選択してポリシーを作成します。

作成したポリシーを選択して開くと、キーや接続文字列が表示されるので、「Connetion string-primary key」の値を控えておきます。（後続の手順で使用します。）

## Azure Time Series Insights を作成する

Azure Time Series Insights を作成する

イベントソースに作成した Event Hub を指定する

## Azure Time Series Insights にモデルとインスタンスを追加する

「Model」の「Types」タブで、「+ Add type」から片を登録します。

#### 「Properties」タブ

| 項目 | 説明 |
|----|----|
| Properties | |
| - Name | 型の名前を入力する |

#### 「Variables」タブ

「+ Add variable」から、下記を登録します。

| 項目 | 説明 |
|----|----|
| Name | Variable の名前を入力する（`Score` など） |
| Kind | 「Numeric」を指定する |
| Value | 「Custom」を選択し、 `$event['score'].Long` と入力する |

それぞれ入力したら、「Save」から保存します。

つぎに、「Model」の「Instances」タブで、「+ Add instance」からインスタンスを登録します。

#### 「Properties」タブ

| 項目 | 説明 |
|----|----|
| Time Series ID | テレメトリの `deviceId` として指定するID（ `via-func` など）を入力する |
| Type | 作成した型を指定する |

それぞれ入力したら、「Save」から保存します。

[README に戻る](./README.md)