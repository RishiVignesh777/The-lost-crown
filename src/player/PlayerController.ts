import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Axis,
  Space,
  KeyboardEventTypes,
  PointerEventTypes
} from '@babylonjs/core';
import { Player } from './Player';
import { playSound } from '../utils/helpers';
import { AUDIO_PATHS } from '../utils/constants';

export class PlayerController {
  public camera: ArcRotateCamera;
  public moveSpeed = 8.5;
  public sprintSpeed = 14.0;
  public jumpStrength = 9.5;
  public gravity = -24.0;

  private velocityY = 0;
  private isGrounded = true;

  // Key states
  public keyForward = false;
  public keyBackward = false;
  public keyLeft = false;
  public keyRight = false;
  public keySprint = false;

  // Mobile virtual joystick input
  public virtualInput = new Vector3(0, 0, 0);

  private footstepTimer = 0;

  constructor(public scene: Scene, public player: Player, canvas: HTMLCanvasElement) {
    // Third-person camera following Aren
    this.camera = new ArcRotateCamera(
      'PlayerThirdPersonCamera',
      -Math.PI / 2,
      Math.PI / 2.8,
      9.0,
      new Vector3(player.root.position.x, player.root.position.y + 1.8, player.root.position.z),
      scene
    );

    this.camera.lowerRadiusLimit = 3.5;
    this.camera.upperRadiusLimit = 16.0;
    this.camera.lowerBetaLimit = 0.15;
    this.camera.upperBetaLimit = Math.PI / 2.05; // Prevent camera from dipping under ground
    this.camera.attachControl(canvas, true);

    // Camera collision against walls
    this.camera.checkCollisions = true;

    this.setupInput(canvas);
  }

  private setupInput(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keyForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keyBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keyLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keyRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keySprint = true;
          break;
        case 'Space':
          this.tryJump();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keyForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keyBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keyLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keyRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keySprint = false;
          break;
      }
    });
  }

  public tryJump(): void {
    if (this.isGrounded && !this.player.isVictorious) {
      this.velocityY = this.jumpStrength;
      this.isGrounded = false;
      this.player.animation.setState('jump');
    }
  }

  public update(deltaTime: number): void {
    if (this.player.isVictorious) {
      this.player.update(deltaTime);
      this.updateCameraTarget();
      return;
    }

    // Camera forward and right vectors projected onto XZ plane
    const forward = this.camera.getDirection(Axis.Z);
    const right = this.camera.getDirection(Axis.X);

    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    let inputZ = 0;
    let inputX = 0;

    if (this.keyForward) inputZ += 1;
    if (this.keyBackward) inputZ -= 1;
    if (this.keyRight) inputX += 1;
    if (this.keyLeft) inputX -= 1;

    // Merge virtual joystick input
    inputX += this.virtualInput.x;
    inputZ += this.virtualInput.z;

    const moveVector = forward.scale(inputZ).add(right.scale(inputX));
    const isMoving = moveVector.lengthSquared() > 0.001;

    const currentSpeed = this.keySprint ? this.sprintSpeed : this.moveSpeed;

    if (isMoving) {
      moveVector.normalize();

      // Move player
      this.player.root.position.addInPlace(moveVector.scale(currentSpeed * deltaTime));

      // Smoothly rotate Aren to face movement vector
      const targetAngle = Math.atan2(moveVector.x, moveVector.z);
      let diff = targetAngle - this.player.root.rotation.y;

      // Wrap angle between -PI and PI
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      this.player.root.rotation.y += diff * Math.min(1, 12 * deltaTime);

      if (this.isGrounded && !this.player.isAttacking && !this.player.isHurt) {
        this.player.animation.setState(this.keySprint ? 'run' : 'walk');
      }

      // Footstep sound loop
      this.footstepTimer += deltaTime;
      const stepInterval = this.keySprint ? 0.26 : 0.38;
      if (this.isGrounded && this.footstepTimer >= stepInterval) {
        playSound(AUDIO_PATHS.STEP, 0.3);
        this.footstepTimer = 0;
      }
    } else {
      if (this.isGrounded && !this.player.isAttacking && !this.player.isHurt) {
        this.player.animation.setState('idle');
      }
    }

    // Apply Gravity and Ground Check
    this.velocityY += this.gravity * deltaTime;
    this.player.root.position.y += this.velocityY * deltaTime;

    const groundY = 0; // Standard ground level
    if (this.player.root.position.y <= groundY) {
      this.player.root.position.y = groundY;
      this.velocityY = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        playSound(AUDIO_PATHS.STEP, 0.4);
      }
    }

    this.player.update(deltaTime);
    this.updateCameraTarget();
  }

  private updateCameraTarget(): void {
    // Camera target follows player neck/upper chest
    const targetY = this.player.root.position.y + 1.8;
    this.camera.target.x = this.player.root.position.x;
    this.camera.target.y = targetY;
    this.camera.target.z = this.player.root.position.z;
  }
}
