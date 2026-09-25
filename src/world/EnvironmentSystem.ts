import {
  Scene,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  Color3,
  ParticleSystem,
  Texture,
  PointLight
} from '@babylonjs/core';
import { AncientLocation3DConfig } from '../data/locations';

export class EnvironmentSystem {
  public sunLight!: DirectionalLight;
  public ambientLight!: HemisphericLight;
  public dustParticles!: ParticleSystem;

  constructor(public scene: Scene) {
    this.setupLighting();
    this.setupParticles();
  }

  private setupLighting(): void {
    const scene = this.scene;
    this.ambientLight = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
    this.ambientLight.intensity = 0.85;

    this.sunLight = new DirectionalLight('SunLight', new Vector3(-0.4, -1, 0.6).normalize(), scene);
    this.sunLight.intensity = 1.3;
  }

  private setupParticles(): void {
    const scene = this.scene;
    // Ambient floating golden dust motes & sunlight glints
    this.dustParticles = new ParticleSystem('DustParticles', 800, scene);
    this.dustParticles.particleTexture = new Texture('/assets/objects/torch.png', scene);

    this.dustParticles.emitter = new Vector3(0, 8, 0);
    this.dustParticles.minEmitBox = new Vector3(-45, -6, -45);
    this.dustParticles.maxEmitBox = new Vector3(45, 12, 45);

    this.dustParticles.color1 = new Color3(1.0, 0.85, 0.4).toColor4(0.6);
    this.dustParticles.color2 = new Color3(0.9, 0.6, 0.2).toColor4(0.4);
    this.dustParticles.colorDead = new Color3(0.2, 0.1, 0.0).toColor4(0.0);

    this.dustParticles.minSize = 0.15;
    this.dustParticles.maxSize = 0.45;
    this.dustParticles.minLifeTime = 3.0;
    this.dustParticles.maxLifeTime = 6.0;
    this.dustParticles.emitRate = 90;
    this.dustParticles.blendMode = ParticleSystem.BLENDMODE_ADD;
    this.dustParticles.gravity = new Vector3(0, -0.05, 0);
    this.dustParticles.direction1 = new Vector3(-0.2, -0.1, -0.2);
    this.dustParticles.direction2 = new Vector3(0.2, 0.1, 0.2);
    this.dustParticles.minAngularSpeed = 0;
    this.dustParticles.maxAngularSpeed = Math.PI;

    this.dustParticles.start();
  }

  public applyLocationEnvironment(config: AncientLocation3DConfig): void {
    const scene = this.scene;
    const env = config.environment;

    scene.clearColor = env.skyColor.toColor4(1.0);
    scene.fogMode = Scene.FOGMODE_EXP;
    scene.fogDensity = env.fogDensity;
    scene.fogColor = env.fogColor;

    this.ambientLight.groundColor = env.groundColor;
    this.ambientLight.diffuse = env.sunColor;

    this.sunLight.diffuse = env.sunColor;
    this.sunLight.direction = env.sunDirection;
    this.sunLight.intensity = env.sunIntensity;

    this.dustParticles.color1 = env.ambientDustColor.toColor4(0.7);
  }
}
