# デモ: obniz ホステッドアプリから IoT Hub にテレメトリデータを送信する（Azure Web Apps）

## 大まかな流れ

- [Azure IoT Hub を作成する](#azure-iot-hub-を作成する)
- [Azure IoT Hub にデバイスを追加する](#azure-iot-hub-にデバイスを追加する)
- [Azure IoT Hub に追加したデバイスの接続文字列を確認する](#azure-iot-hub-に追加したデバイスの接続文字列を確認する)


## Azure IoT Hub を作成する

リソースグループ内の「+ Create」からリソースの作成に進み、「IoT Hub」の「Create」を選択します。

#### 「Basics」タブ

| 項目 | 説明 |
|----|----|
| Project Details | |
| - Subscription | 利用するサブスクリプションを指定する |
| - Resource Group | 利用するリソースグループを指定する |
| Instance Details | |
| - IoT hub name | IoT hub の名前（ `iot-` で始まる文字列）を入力する |
| - Region | 最寄りのリージョン（「Japan East」など）を選択する | 

#### 「Monitoring」タブ

今回は変更しません。

#### 「Management」タブ

| 項目 | 説明 |
|----|----|
| Scale tier and units | |
| - Pricing and scale tier| 利用する tier （「F1: Free tier」など）を選択する |
| Role-based access control | 「Shared access policy + RBAC」を選択する |

入力できたら、「Review + create」を選択して入力内容を確認し、「Create」を選択してリソースの作成を開始します。

リソースの作成が完了したら、「Go to resource」ボタンから作成した IoT Hub の画面に遷移します。

## Azure IoT Hub にデバイスを追加する

IoT Hub の左のメニューから、「Device management」の「Devices」を開きます。

「+ Add Device」からデバイスを追加します。

| 項目 | 説明 |
|----|----|
| Device ID | 任意のデバイス ID を入力する |
| Authentication type | 「Symmetric key」のまま |
| Auto-generate keys | 有効のまま |
| Connect this device to an IoT Hub | 「Enable」のまま |
| Parent device | 「No parent device」のまま |

入力できたら、「Save」を選択してデバイスを追加します。

## Azure IoT Hub に追加したデバイスの接続文字列を確認する

ここで、作成したデバイスの **接続文字列** を確認しておきます。

作成したデバイスを選択して開き、「Primary Connection String」の値を控えておきましょう。（後続の手順で使用します。）
