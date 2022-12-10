# message types

## note to self
A msg encrypted with your own public key (needs to be decrypted with your
private key), so that only *you* are able to decrypt it.

Should keep the list of your friends as a private message, so that it is not
visible to anyone else.

## shared private message
* create a new keypair for a given group of users
* send a priv msg to each person in the group
    - the private msg contains the public key for the group
    - everyone in the group uses the pub key to decrypt to msgs written
      to  the group

* you know who your friends are b/c you save that data in a private file. Then you request any messages from your friends. **note** This does sort of leak info about who your friends are, b/c if you request messages from a given group of people, then those are your friends.

