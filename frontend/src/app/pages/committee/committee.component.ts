import { Component, OnInit } from '@angular/core';

export class CommitteeMember {
  imageUrl: string;
  name: string;
  role: string;

  constructor(imageUrl: string, name: string, role: string) {
    this.imageUrl = imageUrl;
    this.name = name;
    this.role = role;
  }
}

@Component({
  selector: 'lsd-committee',
  templateUrl: 'committee.component.html',
  styleUrls: ['committee.component.sass']
})
export class CommitteeComponent implements OnInit {

  committeeMembers = [
    new CommitteeMember('phoebe.jpg', 'Phoebe', 'President'),
    new CommitteeMember('karl.jpg', 'Karl', 'Vice-President'),
    new CommitteeMember('amber.jpg', 'Amber', 'RAPS Secretary'),
    new CommitteeMember('ray.jpg', 'Ray', 'Treasurer'),
    new CommitteeMember('claudia.jpg', 'Claudia', 'Social Secretary'),
    new CommitteeMember('laura.jpg', 'Laura', 'Social Secretary'),
  ];

  constructor() { }

  ngOnInit() {
  }

}
