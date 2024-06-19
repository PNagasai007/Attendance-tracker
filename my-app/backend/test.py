import pickle

# Load the encodings from the file
with open('EncodeFile.p', 'rb') as file:
    encodings = pickle.load(file)

# Check the type of the loaded data to understand its structure
print(type(encodings))

# Assuming the encodings are stored in a list
if isinstance(encodings, list):
    num_encodings = len(encodings)
    print(f'There are {num_encodings} encodings in the file.')
else:
    print('The data structure is not a list. Please inspect the data to understand its format.')
