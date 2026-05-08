
def clean_text(text:str)->str:
    return text.strip().lower()

def enhance_prompt(text:str)->str:
    base=text
    enhanced = f"""
        {base},
        modern ecommerce product design,
        clean background,
        centered composition,
        high quality,
        sharp details,
        professional mockup,
        no blur, no watermark
        """
    return enhanced.strip()

def validate_prompt(text:str)->str:
    if(len(text.split())<3):
        text+=" detailed design"

    return text

def preprocess_prompt(user_text:str)->str:
    text=clean_text(user_text)
    text=validate_prompt(text)
    final_prompt=enhance_prompt(text)
    return final_prompt