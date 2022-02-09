#include "CommunicationHandlers/CommunicationHandler_OBD2.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_OBD2_H
namespace EFIGenie
{	
		CommunicationHandler_OBD2::CommunicationHandler_OBD2(ICommunicationService *communicationService, SystemBus *systemBus, const OBD2VariableMap *variableMap) :
			_communicationService(communicationService),
			_systemBus(systemBus),
			_variableMap(variableMap)
		{
			_communicationHandler = new CommunicationHandler([this](void *data, size_t length) { return this->Receive(data, length); });
			_communicationService->RegisterHandler(_communicationHandler);
		}

		CommunicationHandler_OBD2::~CommunicationHandler_OBD2()
		{
			_communicationService->UnRegisterHandler(_communicationHandler);
			delete _communicationHandler;
		}

		size_t CommunicationHandler_OBD2::Receive(void *data, size_t length)
		{
			uint8_t service = *reinterpret_cast<uint8_t *>(data); //grab service from data
			data = reinterpret_cast<uint8_t *>(data) + 1; //ofset data

			switch(service)
			{
				case 1:
				{
					uint8_t pid = *reinterpret_cast<uint8_t *>(data); //grab pid from data
					data = reinterpret_cast<uint8_t *>(data) + 1; //offset data
					switch(pid)
					{
						case 5:
						{
      						std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->EngineCoolantTempID); //find the variable iterator
							if(it != _systemBus->Variables.end())
							{
								const Variable ectVariable = *it->second; //pull variabled out of the iterator
								uint8_t ect = (ectVariable + 40).To<uint8_t>(); //add 40 to align with -40 to 215 of obd2 pid. then convert to uint8_t
								_communicationService->Send(&ect, 1); //send formatted ect variable back
								return 2; //return that we parsed 2 bytes from the data received
							}
						}
					}
				}
			}

			return 0;
		}
}
#endif