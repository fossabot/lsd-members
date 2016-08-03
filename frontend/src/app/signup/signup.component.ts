import { Component } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
  FORM_DIRECTIVES,
  REACTIVE_FORM_DIRECTIVES
} from '@angular/forms';
import { CustomValidators } from '../utils';

@Component({
  templateUrl: 'app/signup/signup.component.html'
})
export class SignupComponent {

  signupForm: FormGroup;

  ctrlName: FormControl;
  ctrlPhoneNumber: FormControl;

  constructor(private builder: FormBuilder) {
    this.ctrlName = new FormControl('', Validators.required);
    this.ctrlPhoneNumber = new FormControl('', Validators.compose([Validators.required, CustomValidators.phoneNumber]));

    this.signupForm = builder.group({
      name: this.ctrlName,
      phoneNumber: this.ctrlPhoneNumber
    });
  }

}
