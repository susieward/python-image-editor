from copy import deepcopy
from typing import Dict, Any

def map_dictionary(to_be_mapped: Dict[str, Any], key_map: Dict[str, str], reverse: bool = False) -> Dict[str, Any]:
    mapped_dict = deepcopy(to_be_mapped)

    for key, val in key_map.items():
        if reverse:
            mapped_dict[key] = mapped_dict.pop(val)
        else:
            mapped_dict[val] = mapped_dict.pop(key)

    return mapped_dict
