import { Scene, SceneLoader, AbstractMesh, AnimationGroup, TransformNode } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export interface LoadedModelResult {
  root: TransformNode;
  meshes: AbstractMesh[];
  animationGroups: AnimationGroup[];
}

export class AssetLoader {
  private static cache: Map<string, LoadedModelResult> = new Map();

  public static async loadModel(scene: Scene, rootUrl: string, fileName: string): Promise<LoadedModelResult> {
    const fullPath = `${rootUrl}${fileName}`;
    try {
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, scene);
      const rootNode = new TransformNode(`Model_${fileName}`, scene);
      for (const mesh of result.meshes) {
        if (!mesh.parent) {
          mesh.parent = rootNode;
        }
      }
      return {
        root: rootNode,
        meshes: result.meshes,
        animationGroups: result.animationGroups
      };
    } catch (err) {
      console.warn(`Failed to import 3D model ${fullPath}, utilizing procedural fallback geometry:`, err);
      const fallbackRoot = new TransformNode(`Fallback_${fileName}`, scene);
      return {
        root: fallbackRoot,
        meshes: [],
        animationGroups: []
      };
    }
  }
}
