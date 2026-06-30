# PersonalFin — Lähteülesanne (v2)

> v2 laiendus: korduvad arved (auto-täidavad kuu) + investeeringute/netovara
> moodul trendi jälgimisega. Vt punktid 4.6, 4.7 ja andmemudel punktis 6.1.


## 1. Eesmärk
Rakendus, mis aitab kasutajal järgida **50/30/20 finantsreeglit** ja
distsiplineerib igakuiselt oma raha jälgima. App tuletab iga kuu meelde andmed
sisestada, hindab kui hästi kurssi peeti ja annab kuised kokkuvõtted.

## 2. Kasutaja
Üks kasutaja (Keiro), ainult enda jaoks. Andmed telefonis lokaalselt.

## 3. 50/30/20 põhimõte
Neto sissetulek jagatakse kolme ämbrisse:

| Ämber | Siht | Sisu |
|-------|------|------|
| **Vajadused** | 50% | eluase, laenud, kindlustused, toit, kütus, kommunaalid, side |
| **Soovid** | 30% | meelelahutus, hobid, kulutamiseks, tellimused |
| **Säästud / investeeringud** | 20% | kõrvale, III sammas, investeerimiskonto, pension |

Sihtprotsendid on muudetavad (vaikimisi 50/30/20).

## 4. Põhifunktsioonid (MVP)

### 4.1 Seadistus
- Sea kuu neto sissetulek → app arvutab automaatselt 50/30/20 sihtsummad.
- Sihtprotsendid muudetavad.
- Algväärtused seemnetakse kasutaja Exceli ("Igakuine eelarve") põhjal
  (vt punkt 7).

### 4.2 Kuu mudel (kolm kihti)
Iga kuu ämbrite tegelik summa = **püsiarved + jooksvad kulud**:
- **Püsiarved** (Arved vaade) — iga kuu samad, sead korra (üür, laen, kommunaalid)
- **Jooksvad kulud** (Kuu vaade) — lisad kuu jooksul: summa + ämber
  (vajadus/soov/sääst) + märkus
- **Sissetulek** — muudetav iga kuu

Ämber: vajadused = needs-arved + needs-kulud; soovid = wants-arved + wants-kulud;
säästud = investeeringupanused + sääst-kulud. Skoor = need tegelikud vs 50/30/20.

### 4.3 Kursihinnang
Pärast sisestust app arvutab, kui hästi kurssi peeti:
- iga ämbri tegelik % vs siht %
- üldskoor (nt 0–100) või hinnang (suurepärane / okei / üle eelarve)
- visuaalne tagasiside paletist värvidega (roheline ~ punane asemel paletti
  sobivad toonid)

### 4.4 Igakuine teavitus
- Kuu lõpus / alguses push-teavitus: "Sisesta selle kuu andmed".
- PWA Notifications API (telefonis, kui app lubatud).

### 4.5 Raportid ja ajalugu
- Iga kuu kirje salvestub → ajalugu.
- Kuude trend: kuidas 50/30/20 jaotus ajas muutub.
- Lihtsad graafikud (ämbrite jaotus, säästumäär ajas).

### 4.6 Korduvad arved (püsikulud)
- Halda korduvaid arveid: nimi, summa, ämber (vajadus / soov).
- Iga arve summa loeb automaatselt kuu vajaduste/soovide kokku.
- Seemnetud Exceli püsikuludest (vt punkt 7).

### 4.7 Investeeringud ja netovara
Eraldi moodul varade jälgimiseks:
- **Kontod**: II/III sammas, ETF, rainy day jne — iga konto kohta nimi, tüüp,
  igakuine panus.
- **Kuine väärtus**: iga kuu sisestab konto praeguse väärtuse → portfelli
  koguväärtus ja **kasvugraafik ajas**.
- **Panus vs kasv**: näeb kui palju kasv tuleb enda panusest, kui palju tõusust.
- **Netoväärtus**: varad (investeeringud + kinnisvara) miinus laenud (kodulaen,
  liising) → koguneto vara trend (nagu Exceli "Hetkeseis").

## 5. MVP-st VÄLJAS (hiljem)
- Panga import (CSV / API)
- Üksiktehingute sisestus ja auto-liigitus
- Ühiste kulude jagamine (Liisaga) — app on Keiro isiklik vaade
- Mitu kasutajat, pilve sync, mitu seadet

## 6. Tehniline lahendus
- **React + Vite**, PWA (installitav telefoni avalehele)
- **IndexedDB** (Dexie teek) — andmed lokaalselt telefonis
- **Notifications API** — igakuine meeldetuletus
- **Offline-first** — töötab ilma internetita
- Hosting: otsustamata; MVP töötab ilma serverita (andmed seadmes)

### 6.1 Andmemudel (IndexedDB / Dexie)
- **settings**: sissetulek, sihtprotsendid, teavitus
- **bills**: `{ id, name, amount, bucket: needs|wants, active }`
- **accounts**: `{ id, name, group: invest|property|loan, contribution }`
- **snapshots**: `{ accountId, month, value }` — üks väärtus konto+kuu kohta
- **months**: `{ month, income, needs, wants, savings }`

Tuletatud: kuu vajadused/soovid eeltäide = arvete summa ämbri kaupa; säästude
panus = invest-kontode panuste summa; netovara = varad − laenud (kuu snapshot'ide
põhjal).

## 7. Algandmed (Exceli "Igakuine eelarve" põhjal)
Vaikeväärtused, mida kasutaja saab muuta:
- Neto sissetulek: **3540 €** (Keiro palk)
- Püsivad vajadused (viide): auto liising 215, kindlustused, kodulaen 702,
  kommunaalid 150, kütus 200, toit 600, side 40 jne
- Soovid (viide): kulutamiseks ~250, Crossfit 100, AI rakendused 25, side 23
- Säästud (viide): kõrvale/invest ~1746, III sammas, investeerimiskonto

> Märkus: kasutaja tegelik eelarve sisaldab ühiseid kulusid Liisaga ja
> detailset netovara jälgimist. App MVP keskendub **isiklikule 50/30/20
> vaatele**, mitte kogu Exceli reprodutseerimisele.

## 8. Disain
Värvipalett (soe, mahe, maalähedane) — fail `värvikood.png`:
- `#332E2B` tume pruun (tekst / tume taust)
- `#72393F` veinipunane (rõhk / hoiatus)
- `#AD9D8D` taupe (sekundaarne)
- `#D0C8BD` hele taupe (pinnad)
- `#D9D9D9` hall (piirid)
- `#F0E9E3` kreem (taust)

Mobiilisõbralik, semantiline, lihtne.

## 9. Edasised etapid (peale MVP-d)
1. Üksiktehingute sisestus + kategooriad
2. Netovara moodul (investeeringud, laenud, neto)
3. Pilve sync / mitu seadet (kui vaja)
4. Hosting Zone.ee peal (kui veebis vaja jagada)
