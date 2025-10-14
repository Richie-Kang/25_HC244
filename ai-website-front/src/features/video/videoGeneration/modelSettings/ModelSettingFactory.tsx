import { ModelSettingBase } from "./ModelSettingBase";
import { ImageKlingModelSetting } from "./image/ImageKlingModelSetting";
import { ImageWanModelSetting } from "./image/ImageWanModelSetting";
import { ImageHunyuanModelSetting } from "./image/ImageHunyuanModelSetting";
import { ImageVeo2ModelSetting } from "./image/ImageVeo2ModelSetting";
import { ImagePixverseModelSetting } from "./image/ImagePixverseModelSetting";
import { VideoHunyuanModelSetting } from "./video/VideoHunyuanModelSetting";
import { TextVeo2ModelSetting } from "./text/TextVeo2ModelSetting";

export class ModelSettingFactory {
  static getModelSetting(modelType: string, mode: "image" | "text" | "video"): ModelSettingBase {
    switch (mode) {
      case "image":
        switch (modelType) {
          case "kling":
            return new ImageKlingModelSetting();
          case "wan":
            return new ImageWanModelSetting();
          case "hunyuan":
            return new ImageHunyuanModelSetting();
          case "veo2":
            return new ImageVeo2ModelSetting();
          case "pixverse":
            return new ImagePixverseModelSetting();
          default:
            return new ImageKlingModelSetting();
        }
      case "video":
        switch (modelType) {
          case "hunyuan":
            return new VideoHunyuanModelSetting();
          default:
            return new VideoHunyuanModelSetting();
        }
      case "text":
        return new TextVeo2ModelSetting();
      default:
        return new TextVeo2ModelSetting();
    }
  }
}
