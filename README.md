# MMM-Hinweissystem

## Setup

### NodeJS

Aus dem System muss NodeJS installiert sein.
Node kann [hier](https://nodejs.org/en) heruntergeladen werden.
Am besten ist die neuste LTS Version.

Stelle bei der Installation von Node sicher, dass der npm package manager mit installiert wird und die PATH Systemumgebungs-Variablen hinzugefügt werden.

---

### Installation und manueller Start

- Entpacke die Zip in einen beliebigen Ordner
- Öffne ein Konsolenfenster (Windows-Taste -> "cmd")
- Wechsle in das Projekt-Verzeichnis (`> cd path\to\mmm-hinweissystem`)
- Führe `npm run i; npm run tsc` aus
  - Dies installiert die nötigen Libraries und transpiliert das Projekt

### .env

- Benenne die Datei ".env.example" zu ".env" um und setze den Port darin auf den gewünschten Wert

Das Programm kann jetzt manuell über `node .\src\app.js` gestartet werden und ist dann über `localhost` erreichbar

### Windows-Service erstellen

Öffne in einem Konsolenfenster das Projekt-Verzeichnis und führe `node .\setup-service.js` aus

- Windows wird nach einigen Berechtigungen fragen, diesen muss zugestimmt werden

### Verknüpfung erstellen

Alternativ kann auch eine Windows-Verknüpfung auf die Datei `.\start.bat` erstellt werden. Damit muss die App immer mit einem Doppelklick gestartet werden. Daraufhin öffnet sich ein Konsolenfenster wo etwaige Fehler angezeigt werden.

## Konfiguration

### Sounds

Es muss in dem Root-Verzeichnis (wahrscheinlich "mmm-hinweissystem" gennant) das Verzeichnis `soundConfig` vorhanden sein. In diesem müssen die Dateien `hintergrundsounds.json`, `hinweise.json` und `outros.json` existieren.

Der Inhalt der Dateien muss den folgenden Mustern entsprechen:

#### hintergrundsounds.json:

```
[
  {
    "filename": "Sound1.mp3",
    "room": "gelb"
  },
  {
    "filename": "Sound2.mp3",
    "room": "orange"
  }
]

```

#### hinweise.json:

```
{
  "yellow": [
    {
      "id": "section-1",
      "name": "Teil 1",
      "hints": [
        {
          "de": {
            "title": "Hinweis 1",
            "subtitle": "Untertitel für Hinweis 1",
            "transcript": "Tooltip/Transkript für Hinweis 1",
            "filename": "Hinweis1.mp3"
          },
          "en": {
            "title": "Hint 1",
            "subtitle": "Subtitle for Hint 1",
            "transcript": "Tooltip/Transcript for Hint 1",
            "filename": "Hint1.mp3"
          }
        },
				{
          "de": {
            "title": "Hinweis 2",
            "subtitle": "Untertitel für Hinweis 2",
            "transcript": "Tooltip/Transkript für Hinweis 2",
            "filename": "Hinweis2.mp3"
          },
          "en": {
            "title": "Hint 2",
            "subtitle": "Subtitle for Hint 2",
            "transcript": "Tooltip/Transcript for Hint 2",
            "filename": "Hint2.mp3"
          }
        },
        ...
      ]
    },
    {
      "id": "section-2",
      "name": "Teil 2",
      "hints": [
        ...
      ]
			...
    },
    ...
  ],
  "orange": [
    {
      "id": "section-4",
      "name": "Teil 4",
      "hints": [
        {
          ...
        },
				...
      ]
    },
    ...
  ],
  "beide": [
    {
      "id": "section-7",
      "name": "Teil 7",
      "hints": [
        {
          ...
        },
        ...
      ]
    },
    ...
  ]
}

```

#### outros.json:

```
[
  {
    "de": {
      "title": "SIEGER",
      "filename": "sieger.mp3"
    },
    "en": {
      "title": "WINNER",
      "filename": "winner.mp3"
    }
  },
  {
    "de": {
      "title": "VERLIERER",
      "filename": "verlierer.mp3"
    },
    "en": {
      "title": "LOSER",
      "filename": "loser.mp3"
    }
  }
]


```

---

Die Audiodateien müssen in der folgenden Verzeichnisstruktur eingefügt werden:

```
...\mmm-hinweissystem\public\audio\
| - hintergrundsounds
| | - Hintergrundsound1.mp3
| | - Hintergrundsound2.mp3
|
| - outros
| | - de
| | | - Sieger.mp3
| | | - Verlierer.mp3
| |
| | -en
| | | - Winner.mp3
| | | - Loser.mp3
| |
|
| - hinweise
| | - de
| | | - Hinweis1.mp3
| | | - Hinweis2.mp3
| | | ...
| |
| | - en
| | | - Hint1.mp3
| | | - Hint2.mp3
| | | ...

```

Die Namen aller Audiodateien sind frei wählbar, solange sie mit den Namen in den .json Konfigurations-Dateien übereinstimmen.

# Customizing

Ich habe versucht allen Elementen passende IDs und Klasen zu geben um das Customizing zu vereinfachen. Einige dieser IDs und Klassen sind für die korrekte Funktion der App nötig. Am besten sollten keine IDs oder Klassennamen von Elementen geändert oder gelöscht werden.

Ebenso sind manche Stylings für korrekte Funktion nötig (z.B. bei dem Sprachen-Schalter). Am besten sollte das Verhalten der App nach der Änderung des Stylings geprüft werden.

Es können aber Problemlos Klassen zu Elementen hinzugefügt werden (ebenfalls IDs, wenn das Element noch keine ID besaß). Dabei sollte wie im oberen Paragraph darauf geachtet werden, dass die neuen Stylings nicht die Funktion der App beeinträchtigen.

### Sektionen

Die Carts der Hinweise sind in Sektionen eingeteilt. diese werden wie oben beschrieben in der hinweise.json definiert. Auf der Web-Oberfläche werden diese Sektionen so generiert, dass die in der .json angegebene ID auch die ID des Elements ist. Somit kann in css diese Sektion referenziert werden.
