#include "CommunicationHandlers/CommunicationHandler_GetVariable.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_GETVARIABLE_H
namespace EFIGenie
{	
		CommunicationHandler_GetVariable::CommunicationHandler_GetVariable(ICommunicationService *communicationService, std::map<uint32_t, Variable*> *variableMap) :
			_communicationService(communicationService),
			_variableMap(variableMap)
		{
			_communicationHandler = [this](void *data, size_t length) { return this->Receive(data, length); };
			_communicationService->RegisterHandler(&_communicationHandler);
		}

		CommunicationHandler_GetVariable::~CommunicationHandler_GetVariable()
		{
			_communicationService->UnRegisterHandler(&_communicationHandler);
		}

		size_t CommunicationHandler_GetVariable::Receive(void *data, size_t length)
		{
			if(length < sizeof(uint32_t) + sizeof(uint8_t))//make sure there are enough bytes to process a request
				return 0;

			uint32_t variableID = *reinterpret_cast<uint32_t *>(data); //grab service from data
			data = reinterpret_cast<uint32_t *>(data) + 1; //ofset data
			uint8_t offset = *reinterpret_cast<uint8_t *>(data); //grab length from data
			data = reinterpret_cast<uint8_t *>(data) + 1; //ofset data
			
			uint8_t variableBuff[sizeof(VariableType) + sizeof(uint64_t)];//create a buffer for the returned message

			std::map<uint32_t, Variable*>::iterator it = _variableMap->find(variableID); //get the variable
			if (it != _variableMap->end())
			{
				variableBuff[0] = it->second->Type;//type is the first byte returned
				if(it->second->Type == POINTER || it->second->Type == BIGOTHER)//if it is a pointer
				{
					//return the value of the address location of the variable + offset
					std::memcpy(&variableBuff[1], reinterpret_cast<uint64_t *>(it->second->Value) + offset, sizeof(uint64_t));
				}
				else
				{
					//otherwise copy the value of the variable
					std::memcpy(&variableBuff[1], &it->second->Value, sizeof(uint64_t));
				}

				//send the message back
				_communicationService->Send(&variableBuff[0], sizeof(variableBuff));
			}
			return sizeof(uint32_t) + sizeof(uint8_t);//return number of bytes handled
		}
}
#endif