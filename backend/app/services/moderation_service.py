from better_profanity import profanity
from typing import Tuple, List

# Initialize profanity filter
profanity.load_censor_words()

def check_content_moderation(content: str) -> Tuple[bool, List[str]]:
    """
    Check if content contains inappropriate language.
    Returns (is_flagged, flagged_words)
    """
    if not content:
        return False, []
    
    # Check if content contains profanity
    contains_profanity = profanity.contains_profanity(content)
    
    if not contains_profanity:
        return False, []
    
    # Find specific flagged words
    words = content.lower().split()
    flagged_words = []
    
    for word in words:
        # Clean word of punctuation
        clean_word = ''.join(char for char in word if char.isalnum())
        if clean_word and profanity.contains_profanity(clean_word):
            flagged_words.append(clean_word)
    
    return True, list(set(flagged_words))  # Remove duplicates

def add_custom_words(words: List[str]):
    """Add custom words to the profanity filter"""
    profanity.add_censor_words(words)

def remove_custom_words(words: List[str]):
    """Remove words from the profanity filter"""
    for word in words:
        profanity.remove_censor_words([word])
