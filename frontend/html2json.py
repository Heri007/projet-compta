import re
import json
from bs4 import BeautifulSoup

def extraire_donnees_js_de_html(fichier_html, fichier_json):
    """
    Extrait les données des tableaux JavaScript (comptes, tiers, ecritures)
    d'un fichier HTML et les enregistre dans un fichier JSON.

    Args:
        fichier_html (str): Le chemin vers le fichier HTML d'entrée.
        fichier_json (str): Le chemin vers le fichier JSON de sortie.
    """
    try:
        with open(fichier_html, 'r', encoding='utf-8') as f:
            contenu_html = f.read()

        # Utiliser BeautifulSoup pour trouver la balise <script>
        soup = BeautifulSoup(contenu_html, 'html.parser')
        script_tag = soup.find('script')

        if not script_tag:
            print("Erreur : Aucune balise <script> n'a été trouvée dans le fichier HTML.")
            return

        script_content = script_tag.string

        # Utiliser des expressions régulières pour extraire les chaînes des tableaux
        # re.DOTALL permet au point (.) de correspondre aux sauts de ligne
        comptes_match = re.search(r'let\s+comptes\s*=\s*(\[.*?\]);', script_content, re.DOTALL)
        tiers_match = re.search(r'let\s+tiers\s*=\s*(\[.*?\]);', script_content, re.DOTALL)
        ecritures_match = re.search(r'let\s+ecritures\s*=\s*(\[.*?\]);', script_content, re.DOTALL)

        if not (comptes_match and tiers_match and ecritures_match):
            print("Erreur : Impossible de trouver les tableaux 'comptes', 'tiers' ou 'ecritures' dans le script.")
            return

        # Fonction pour nettoyer la chaîne JS et la rendre compatible JSON
        def js_to_json_string(js_array_string):
            # Remplacer les apostrophes par des guillemets doubles
            # Gère correctement les apostrophes échappées comme dans "l\'exercice"
            json_str = js_array_string.replace("'", '"')
            # Ajouter des guillemets doubles autour des clés d'objet (ex: {numero: -> {"numero":)
            json_str = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', json_str)
            return json_str

        # Convertir chaque tableau en une chaîne JSON valide
        comptes_str = js_to_json_string(comptes_match.group(1))
        tiers_str = js_to_json_string(tiers_match.group(1))
        ecritures_str = js_to_json_string(ecritures_match.group(1))

        # Charger les chaînes en objets Python (listes de dictionnaires)
        comptes_data = json.loads(comptes_str)
        tiers_data = json.loads(tiers_str)
        ecritures_data = json.loads(ecritures_str)

        # Combiner toutes les données dans un seul dictionnaire
        donnees_combinees = {
            'comptes': comptes_data,
            'tiers': tiers_data,
            'ecritures': ecritures_data
        }

        # Enregistrer le résultat dans le fichier JSON de sortie
        with open(fichier_json, 'w', encoding='utf-8') as f:
            json.dump(donnees_combinees, f, ensure_ascii=False, indent=4)

        print(f"✅ Les données de {fichier_html} ont été extraites avec succès dans {fichier_json}.")

    except FileNotFoundError:
        print(f"❌ Erreur : Le fichier {fichier_html} n'a pas été trouvé.")
    except json.JSONDecodeError as e:
        print(f"❌ Erreur lors de l'analyse du JSON. Le format des données dans le script est peut-être invalide : {e}")
    except Exception as e:
        print(f"❌ Une erreur inattendue est survenue : {e}")

# --- Utilisation du script ---
# Assurez-vous que le fichier 'essai.html' que vous avez fourni se trouve dans le même dossier.
# Le script créera un fichier 'donnees_comptables.json' avec toutes les données.
extraire_donnees_js_de_html('essai.html', 'donnees_comptables.json')
