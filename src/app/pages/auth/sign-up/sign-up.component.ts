import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  signUpForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['developer', Validators.required]
    });
  }

  selectRole(role: string) {
    this.signUpForm.patchValue({ role });
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const { fullName, email, password, role } = this.signUpForm.value;

      this.authService.signUp(fullName, email, password, role).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Compte créé avec succès ! En attente de l\'approbation de l\'administrateur.';
          alert('Votre inscription a bien été enregistrée. Veuillez patienter jusqu\'à ce qu\'un administrateur approuve votre compte.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'An error occurred during sign up. Please try again.';
          console.error('Sign up error', err);
        }
      });
    } else {
      this.markFormGroupTouched(this.signUpForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}

