using { Currency, managed, sap } from '@sap/cds/common';
using from '@sap/cds-common-content';
namespace sap.capire.bookshop;

@changelog
entity Books : managed {
  key ID : Integer;
  @mandatory title  : localized String(111);
  descr  : localized String(1111);
  @mandatory author : Association to Authors;
  genre  : Association to Genres;
  stock  : Integer;
  price  : Decimal;
  currency : Currency;
  image : LargeBinary @Core.MediaType : 'image/png';
}

//Change History
annotate Books with {
  title @changelog;
  author @changelog: [author.name];
};


entity Authors : managed {
  key ID : Integer;
  @mandatory name   : String(111);
  dateOfBirth  : Date;
  dateOfDeath  : Date;
  placeOfBirth : String;
  placeOfDeath : String;
  books  : Association to many Books on books.author = $self;
}

//Audit Log
annotate Authors with @PersonalData: {
  DataSubjectRole : 'Author',
  EntitySemantics : 'DataSubject'
}{
  ID @PersonalData.FieldSemantics: 'DataSubjectID';
  name @PersonalData.IsPotentiallyPersonal;
  dateOfBirth @PersonalData.IsPotentiallySensitive;  
}


/** Hierarchically organized Code List for Genres */
entity Genres : sap.common.CodeList {
  key ID   : Integer;
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}


@sql.append: ```sql
  GROUP TYPE "FOO"
  GROUP SUBTYPE "BAR"
```
entity E { 
  /**
   * I am the description for "c1"
   */
  c1: Integer;
  @sql.append: 'FUZZY SEARCH INDEX ON'
  text: String(100);
}


@sql.append: ```sql 
 UNLOAD PRIORITY 5  AUTO MERGE  GROUP TYPE FOO GROUP SUBTYPE "bar"
```
Entity E2 {
	C1: Integer  @title: 'C1' ; 
	TEXT: String(100)  @title: 'TEXT' ; 
}

@sql.append: ```sql 
 UNLOAD PRIORITY 5  AUTO MERGE  GROUP TYPE FOO GROUP SUBTYPE "bar"
 partition by range(c1) ((partition 0 <= values < 6), (partition others))
```
Entity E3 {
	C1: Integer  @title: 'C1' ; 
	TEXT: String(100)  @title: 'TEXT' ; 
}