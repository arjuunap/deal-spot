import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FeatureService } from '../../../core/admin-side/features/features';

@Component({
  selector: 'app-add-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './features.html',
  styleUrls: ['./features.css'] // Keep your previous dark CSS here
})
export class Feature {
  featureForm: FormGroup;
  statusMessage: string = '';
  statusType: 'success' | 'error' | '' = '';
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient,
    private featureService : FeatureService
  ) {
    // Initialize the Reactive Form with validation rules
    this.featureForm = this.fb.group({
      attrKeyEn: ['', Validators.required],
      attrKeyAr: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // Prevent submission if the form is empty or invalid
    if (this.featureForm.invalid) {
      this.showMessage('Please fill in both fields.', 'error');
      return;
    }

    this.isSubmitting = true;
    
    // Extract the exact payload structure expected by the backend
    const payload = this.featureForm.value;

    // Execute the POST request
    this.featureService.addFeatures(payload).subscribe({
      next: (response) => {
        // this.showMessage('Feature saved successfully!', 'success');
        console.log('sucess',response)
        this.featureForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.showMessage('Failed to save feature. Check console.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  // Helper method to manage UI feedback
  private showMessage(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
    
    // Auto-clear the message after 3 seconds
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3000);
  }
}