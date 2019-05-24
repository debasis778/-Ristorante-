import { Component, OnInit, ViewChild, Inject  } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  dishIds: string[];
  prev: string;
  next: string;
  dish: Dish;
  disherrMsg: string;
  disharray: any;
  @ViewChild('cform') commentFormDirective;
  comment: Comment;
  commentForm: FormGroup;
  formErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };
  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'rating': {
      'required': 'Rating is required.'
    },
    'comment': {
      'required':      'comment is required.'  
    },
  };

  constructor(private dishService: DishService, private location: Location,
    private route: ActivatedRoute, private fb: FormBuilder, @Inject('BaseURL') private BaseURL) {
      this.createForm();
     }


  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.disharray = dish; this.setPrevNext(dish.id); },
     disherrMsg => this.disherrMsg = <any>disherrMsg);
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  

  goBack(): void {
    this.location.back();
  }
  createForm() {
    this.commentForm = this.fb.group({
      author : ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: [5, [Validators.required]],
      comment: ['', Validators.required]
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }
  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.disharray.comments.push(this.comment);
    console.log(this.disharray);
    
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }

}
