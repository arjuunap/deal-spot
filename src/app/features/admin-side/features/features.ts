import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FeatureService } from '../../../core/admin-side/features/features';
import Swal from 'sweetalert2';
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
  features: any = [];

  constructor(private fb: FormBuilder, private http: HttpClient,
    private featureService : FeatureService
  ) {
    // Initialize the Reactive Form with validation rules
    this.featureForm = this.fb.group({
      attrKeyEn: ['', Validators.required],
      attrKeyAr: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.fetchFeatures();
  }
  fetchFeatures(): void {
    this.featureService.getFeatures().subscribe({
      next: (data: any) => {
        this.features = data;
        console.log('Fetched Features:', this.features);
      },
      error: (err) => {
        console.error('Error fetching features:', err);
       // Optionally, show an error message to the user
        this.showMessage('Failed to load features. Check console.', 'error');
      }
    });
  }

  onSubmit(): void {
    // 1. Prevent submission if the form is empty or invalid
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      // Optional: You can trigger a SweetAlert here too instead of returning silently
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill in both the English and Arabic feature keys.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const formValue = this.featureForm.value;

    // 2. Check for duplicates in the existing features array
    const isDuplicate = this.features.some((feature: any) => {
      const existingKeyEn = feature.attrKeyEn ? feature.attrKeyEn.toLowerCase().trim() : '';
      const existingKeyAr = feature.attrKeyAr ? feature.attrKeyAr.toLowerCase().trim() : '';
      const newKeyEn = formValue.attrKeyEn.toLowerCase().trim();
      const newKeyAr = formValue.attrKeyAr.toLowerCase().trim();

      return existingKeyEn === newKeyEn || existingKeyAr === newKeyAr;
    });

    if (isDuplicate) {
      // 3. Show SweetAlert Warning for Duplicate
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Feature',
        text: 'A feature with this English or Arabic key already exists!',
        confirmButtonColor: '#3085d6'
      });
      return; // Stop the submission
    }

    this.isSubmitting = true;
    
    // Extract the exact payload structure expected by the backend
    const payload = this.featureForm.value;

    // 4. Execute the POST request
    this.featureService.addFeatures(payload).subscribe({
      next: (response) => {
        console.log('Success', response);

        // Success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Feature added successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        // Add the new feature to our local array so the duplicate check works immediately
        this.features.push(payload);

        this.featureForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        
        // Error SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Failed to save feature. Please try again.',
          confirmButtonColor: '#d33'
        });
        
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